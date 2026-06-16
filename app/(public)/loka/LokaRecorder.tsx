"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import {
  CHANT_LINE,
  CHANT_TRANSLATION,
  CHANT_WORDS,
  COUNTDOWN_SEC,
  extForMime,
  fetchAudioBuffer,
  formatTime,
  pickRecorderMime,
  VOCALS_START_SEC,
} from "./loka-shared";

type Phase = "form" | "ready" | "countdown" | "recording" | "review" | "submitting" | "done";

export default function LokaRecorder({
  backingUrl,
  goal,
  onDone,
}: {
  backingUrl: string;
  goal: number;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState({ name: "", email: "", voiceType: "", consent: false });
  const [error, setError] = useState("");
  const [backingState, setBackingState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(COUNTDOWN_SEC);
  const [reviewPlaying, setReviewPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const backingBufRef = useRef<AudioBuffer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string>("");
  const backingSrcRef = useRef<AudioBufferSourceNode | null>(null);
  const t0Ref = useRef<number>(0);
  const startSecRef = useRef<number>(0); // backing position the take began at
  const offsetMsRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  const takeBlobRef = useRef<Blob | null>(null);
  const takeBufRef = useRef<AudioBuffer | null>(null);
  const reviewSrcRef = useRef<AudioBufferSourceNode[]>([]);
  const [takeDurationMs, setTakeDurationMs] = useState(0);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  const runMeter = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2.2));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  async function turnOnMic() {
    setError("");
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!form.voiceType) return setError("Please choose lower or higher.");
    if (!form.consent) return setError("Please tick the box to include your voice.");
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      return setError("That email doesn't look right. You can also leave it blank.");
    }
    try {
      const ctx = ensureCtx();
      await ctx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
      });
      streamRef.current = stream;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      runMeter();

      setBackingState("loading");
      fetchAudioBuffer(ctx, backingUrl)
        .then((buf) => {
          backingBufRef.current = buf;
          setBackingState("ready");
        })
        .catch(() => setBackingState("error"));

      setPhase("ready");
    } catch {
      setError("We couldn't reach your microphone. Please allow it when your browser asks, then try again.");
    }
  }

  function beginCountdown(skipToVocals: boolean) {
    if (backingState !== "ready") return;
    setError("");
    startSecRef.current = skipToVocals ? VOCALS_START_SEC : 0;
    setCount(COUNTDOWN_SEC);
    setPhase("countdown");
    let n = COUNTDOWN_SEC;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        startRecording();
      } else {
        setCount(n);
      }
    }, 1000);
  }

  function startRecording() {
    const ctx = ctxRef.current!;
    const stream = streamRef.current!;
    const buf = backingBufRef.current!;
    chunksRef.current = [];
    mimeRef.current = pickRecorderMime();

    const recorder = mimeRef.current
      ? new MediaRecorder(stream, { mimeType: mimeRef.current })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleRecorderStop;

    const backing = ctx.createBufferSource();
    backing.buffer = buf;
    backing.connect(ctx.destination);
    backingSrcRef.current = backing;

    const t0 = ctx.currentTime + 0.06;
    t0Ref.current = t0;
    recorder.onstart = () => {
      offsetMsRef.current = Math.max(0, Math.round((ctx.currentTime - t0) * 1000));
      setPhase("recording");
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 0.1), 100);
    };
    backing.onended = () => {
      if (recorderRef.current?.state === "recording") stopRecording();
    };

    recorder.start();
    backing.start(t0, startSecRef.current);
  }

  function stopRecording() {
    window.clearInterval(timerRef.current);
    try {
      backingSrcRef.current?.stop();
    } catch {
      /* already stopped */
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  async function handleRecorderStop() {
    const type = mimeRef.current || chunksRef.current[0]?.type || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    takeBlobRef.current = blob;
    try {
      const ctx = ctxRef.current!;
      const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
      takeBufRef.current = buf;
      setTakeDurationMs(Math.round(buf.duration * 1000));
    } catch {
      takeBufRef.current = null;
    }
    setPhase("review");
  }

  function stopReview() {
    reviewSrcRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* noop */
      }
    });
    reviewSrcRef.current = [];
    setReviewPlaying(false);
  }

  function playReview() {
    const ctx = ctxRef.current!;
    const backing = backingBufRef.current!;
    const take = takeBufRef.current;
    stopReview();
    const start = ctx.currentTime + 0.1;

    const b = ctx.createBufferSource();
    b.buffer = backing;
    b.connect(ctx.destination);
    b.start(start, startSecRef.current); // replay the section they sang against
    reviewSrcRef.current.push(b);

    if (take) {
      const v = ctx.createBufferSource();
      v.buffer = take;
      v.connect(ctx.destination);
      v.start(start + offsetMsRef.current / 1000);
      reviewSrcRef.current.push(v);
    }
    b.onended = () => setReviewPlaying(false);
    setReviewPlaying(true);
  }

  function discard() {
    stopReview();
    takeBlobRef.current = null;
    takeBufRef.current = null;
    setPhase("ready");
  }

  async function submit() {
    if (!takeBlobRef.current) return;
    stopReview();
    setPhase("submitting");
    setError("");
    const ext = extForMime(takeBlobRef.current.type);
    const file = new File([takeBlobRef.current], `loka-${Date.now()}.${ext}`, { type: takeBlobRef.current.type });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("voiceType", form.voiceType);
    fd.append("offsetMs", String(offsetMsRef.current));
    fd.append("startMs", String(Math.round(startSecRef.current * 1000)));
    fd.append("durationMs", String(takeDurationMs));
    try {
      const res = await fetch("/api/loka/recordings", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong. Please try again.");
        setPhase("review");
        return;
      }
      setPhase("done");
    } catch {
      setError("We couldn't send your prayer. Please check your connection and try again.");
      setPhase("review");
    }
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  /* ─────────────── UI ─────────────── */

  if (phase === "done") {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-5xl mb-4">✦</div>
          <h2 className="font-serif mb-3" style={{ fontSize: "2rem", fontWeight: 500, color: "var(--ink-900)" }}>
            Thank you. Your prayer is received.
          </h2>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "var(--fg2)", maxWidth: "32ch", margin: "0 auto 1.75rem" }}>
            Your voice will join the others in the prayer wheel after a gentle review. Bless you for
            singing.
          </p>
          <BigButton onClick={onDone}>Hear the prayer wheel →</BigButton>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Headphone guidance, always visible and large */}
      <div
        className="rounded-2xl p-5 mb-7 flex gap-4 items-start"
        style={{ background: "var(--gold-100)", color: "var(--ink-800)" }}
      >
        <span style={{ fontSize: "2rem", lineHeight: 1 }}>🎧</span>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
          <strong>Please put on headphones first.</strong> Then sing along gently with the song.
          There is no wrong way to do this.
        </p>
      </div>

      {phase === "form" && (
        <div className="space-y-6">
          <BigField label="What is your name?">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              autoComplete="name"
              style={{ fontSize: "1.2rem", padding: "0.85rem 1rem" }}
            />
          </BigField>

          <BigField label="Is your voice lower or higher?">
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "LOWER", label: "Lower" },
                { v: "HIGHER", label: "Higher" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, voiceType: v })}
                  className="py-4 rounded-xl border font-semibold transition-colors"
                  style={
                    form.voiceType === v
                      ? { background: "var(--gold-100)", borderColor: "var(--gold-500)", color: "var(--gold-700)", fontSize: "1.25rem" }
                      : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg2)", fontSize: "1.25rem" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </BigField>

          <BigField label="Email (optional)">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Only if you'd like, kept private"
              autoComplete="email"
              style={{ fontSize: "1.1rem", padding: "0.75rem 1rem" }}
            />
          </BigField>

          <label className="flex items-start gap-3 cursor-pointer" style={{ fontSize: "1.1rem", color: "var(--fg1)" }}>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="accent-[#c4922b] mt-1"
              style={{ width: 22, height: 22 }}
            />
            Yes, please include my voice in this shared prayer.
          </label>

          {error && <ErrorNote msg={error} />}
          <BigButton onClick={turnOnMic}>Turn on my microphone →</BigButton>
        </div>
      )}

      {(phase === "ready" || phase === "countdown" || phase === "recording") && (
        <div className="space-y-6">
          {backingState === "error" && (
            <ErrorNote msg="The song isn't ready just yet. Please try again in a little while." />
          )}

          {phase === "ready" && (
            <>
              <Meter level={level} recording={false} />
              <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--fg2)" }}>
                Your microphone is on. Speak a little and watch the bar move. When you feel ready,
                press a button below and we will count you in.
              </p>
              {error && <ErrorNote msg={error} />}
              <div className="space-y-3">
                <BigButton onClick={() => beginCountdown(false)} disabled={backingState !== "ready"}>
                  ● Sing from the beginning
                </BigButton>
                <button
                  onClick={() => beginCountdown(true)}
                  disabled={backingState !== "ready"}
                  className="w-full py-3 rounded-xl border font-semibold transition-colors disabled:opacity-50"
                  style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)", fontSize: "1.1rem" }}
                >
                  Skip to the chanting →
                </button>
                <p className="text-center" style={{ fontSize: "0.95rem", color: "var(--fg3)" }}>
                  {backingState === "loading" ? "Loading the song…" : "“Skip to the chanting” starts where the voices begin."}
                </p>
              </div>
            </>
          )}

          {phase === "countdown" && (
            <div className="text-center py-4">
              <div className="font-serif" style={{ fontSize: "5.5rem", color: "var(--gold-700)", lineHeight: 1 }}>{count}</div>
              <p style={{ fontSize: "1.3rem", color: "var(--fg2)", marginTop: "0.5rem" }}>Take a breath…</p>
              <Subtitles active={false} elapsed={0} />
            </div>
          )}

          {phase === "recording" && (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-2.5" style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--crimson-700)" }}>
                <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--crimson-700)" }} />
                Recording your prayer · {formatTime(elapsed)}
              </div>
              <Subtitles active elapsed={elapsed} />
              <Meter level={level} recording />
              <BigButton onClick={stopRecording} variant="secondary">■ I'm finished</BigButton>
            </div>
          )}
        </div>
      )}

      {(phase === "review" || phase === "submitting") && (
        <div className="space-y-6 text-center">
          <h2 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 500, color: "var(--ink-900)" }}>
            Listen to your prayer
          </h2>
          <p style={{ fontSize: "1.15rem", color: "var(--fg2)", lineHeight: 1.6 }}>
            Here is your voice with the song. If it feels right, send it on. Or sing it again — as
            many times as you like.
          </p>
          <button
            onClick={reviewPlaying ? stopReview : playReview}
            className="w-full py-4 rounded-xl border font-semibold transition-colors"
            style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)", fontSize: "1.2rem" }}
          >
            {reviewPlaying ? "■ Stop" : "▶ Listen back"}
          </button>
          {error && <ErrorNote msg={error} />}
          <BigButton onClick={submit} disabled={phase === "submitting"}>
            {phase === "submitting" ? "Sending…" : "This is my prayer ✦ Send it"}
          </BigButton>
          <button
            onClick={discard}
            disabled={phase === "submitting"}
            className="w-full py-3 font-medium disabled:opacity-50"
            style={{ color: "var(--fg3)", fontSize: "1.05rem" }}
          >
            ↺ Sing again
          </button>
        </div>
      )}

      <p className="text-center mt-7" style={{ fontSize: "0.9rem", color: "var(--fg3)" }}>
        Every voice is welcome. Together we are gathering {goal}.
      </p>
    </Card>
  );
}

/* ─────────────── subtitles ─────────────── */

function Subtitles({ active, elapsed }: { active: boolean; elapsed: number }) {
  // Gently highlight each word in turn so singers can follow along.
  const wordDur = 1.1;
  const idx = active ? Math.floor((elapsed / wordDur) % CHANT_WORDS.length) : -1;
  return (
    <div className="text-center select-none" aria-hidden>
      <p className="font-serif" style={{ fontSize: "clamp(1.6rem, 6vw, 2.4rem)", lineHeight: 1.3, fontWeight: 500 }}>
        {CHANT_WORDS.map((w, i) => (
          <span
            key={i}
            style={{
              color: i === idx ? "var(--gold-700)" : "var(--ink-800)",
              opacity: idx === -1 || i === idx ? 1 : 0.55,
              transition: "color 0.2s, opacity 0.2s",
              marginRight: "0.4em",
            }}
          >
            {w}
          </span>
        ))}
      </p>
      <p className="font-serif italic mt-2" style={{ fontSize: "1.1rem", color: "var(--fg2)" }}>
        {CHANT_TRANSLATION}
      </p>
    </div>
  );
}

/* ─────────────── small presentational helpers ─────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-9"
      style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
    >
      {children}
    </div>
  );
}

function BigButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl font-semibold transition-all duration-150 disabled:opacity-50"
      style={{
        padding: "1.1rem 1.5rem",
        fontSize: "1.25rem",
        background: variant === "primary" ? "var(--gold-600)" : "var(--lapis-700)",
        color: variant === "primary" ? "var(--fg-on-gold)" : "var(--fg-on-dark)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </button>
  );
}

function Meter({ level, recording }: { level: number; recording: boolean }) {
  return (
    <div>
      <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--parch-200)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-75"
          style={{ width: `${Math.round(level * 100)}%`, background: recording ? "var(--crimson-700)" : "var(--gold-500)" }}
        />
      </div>
      <p className="text-center mt-1" style={{ fontSize: "0.9rem", color: "var(--fg3)" }}>Microphone</p>
    </div>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return (
    <p className="px-4 py-3 rounded-xl" style={{ background: "var(--terra-100)", color: "var(--terra-700)", fontSize: "1.05rem" }}>
      {msg}
    </p>
  );
}

function BigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-2 font-semibold" style={{ fontSize: "1.2rem", color: "var(--ink-800)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
