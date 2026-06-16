"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  extForMime,
  fetchAudioBuffer,
  formatTime,
  pickRecorderMime,
} from "./loka-shared";

type Phase = "intro" | "ready" | "countdown" | "recording" | "review" | "submitting" | "done";

export default function LokaRecorder({ backingUrl, onDone }: { backingUrl: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [form, setForm] = useState({ name: "", email: "", voiceType: "", consent: false });
  const [error, setError] = useState("");
  const [backingState, setBackingState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(3);
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

  // Live mic level meter (runs during ready + recording).
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

  async function requestMic() {
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setError("Please enter a valid email.");
    if (!form.voiceType) return setError("Please choose your voice range.");
    if (!form.consent) return setError("Please give consent to include your voice.");

    try {
      const ctx = ensureCtx();
      await ctx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      runMeter();

      // Load the backing track in the background.
      setBackingState("loading");
      fetchAudioBuffer(ctx, backingUrl)
        .then((buf) => {
          backingBufRef.current = buf;
          setBackingState("ready");
        })
        .catch(() => setBackingState("error"));

      setPhase("ready");
    } catch {
      setError("Microphone access was blocked. Please allow it in your browser and try again.");
    }
  }

  function beginCountdown() {
    if (backingState !== "ready") return;
    setError("");
    setCount(3);
    setPhase("countdown");
    let n = 3;
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

    // Play the backing track (heard through headphones) and align the take to it.
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
    backing.start(t0);
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
    b.start(start);
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
    const file = new File([takeBlobRef.current], `loka-${Date.now()}.${ext}`, {
      type: takeBlobRef.current.type,
    });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("voiceType", form.voiceType);
    fd.append("offsetMs", String(offsetMsRef.current));
    fd.append("durationMs", String(takeDurationMs));
    try {
      const res = await fetch("/api/loka/recordings", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Upload failed. Please try again.");
        setPhase("review");
        return;
      }
      setPhase("done");
    } catch {
      setError("Network error. Please try again.");
      setPhase("review");
    }
  }

  // Cleanup on unmount.
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
          <div className="text-4xl mb-3">✦</div>
          <h2 className="font-serif mb-2" style={{ fontSize: "1.6rem", fontWeight: 500, color: "var(--ink-900)" }}>
            Thank you, your voice is received.
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--fg2)", maxWidth: "42ch", margin: "0 auto" }}>
            We&apos;ll add your take to the collective song after a quick review. Meanwhile, listen to
            the voices already gathered.
          </p>
          <Button onClick={onDone}>Listen to the sangha →</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Headphone / mic guidance is always visible at the top */}
      <div
        className="rounded-xl p-4 mb-6 flex gap-3 text-sm"
        style={{ background: "var(--gold-100)", color: "var(--ink-800)" }}
      >
        <span className="text-lg leading-none">🎧</span>
        <div>
          <p className="font-semibold mb-1">Before you sing</p>
          <ul className="list-disc pl-4 space-y-0.5" style={{ color: "var(--fg1)" }}>
            <li><strong>Wear headphones</strong>, so the backing track isn&apos;t picked up by your mic.</li>
            <li>Use a good microphone in a quiet room if you can.</li>
            <li>You&apos;ll hear the song while you record; sing along with your heart.</li>
          </ul>
        </div>
      </div>

      {phase === "intro" && (
        <div className="space-y-4">
          <Field label="Your name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fatima al-Rashid" autoComplete="name" />
          </Field>
          <Field label="Email" required hint="Kept private, never shown publicly.">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Your voice range" required>
            <div className="flex gap-2">
              {[
                { v: "LOWER", label: "Lower voice" },
                { v: "HIGHER", label: "Higher voice" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, voiceType: v })}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors"
                  style={
                    form.voiceType === v
                      ? { background: "var(--gold-100)", borderColor: "var(--gold-500)", color: "var(--gold-700)" }
                      : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg2)" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: "var(--fg2)" }}>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="accent-[#c4922b] mt-0.5"
            />
            I&apos;m happy for my voice to be part of this collective recording shared on this site.
          </label>
          {error && <ErrorNote msg={error} />}
          <Button onClick={requestMic} size="lg" className="w-full sm:w-auto">
            Enable microphone →
          </Button>
        </div>
      )}

      {(phase === "ready" || phase === "countdown" || phase === "recording") && (
        <div className="space-y-5">
          <Meter level={level} recording={phase === "recording"} />

          {backingState === "loading" && <p className="text-sm" style={{ color: "var(--fg3)" }}>Loading the song…</p>}
          {backingState === "error" && (
            <ErrorNote msg="The backing track isn't available yet. Please check back soon." />
          )}

          {phase === "ready" && (
            <>
              <p className="text-sm" style={{ color: "var(--fg2)" }}>
                Your mic is live, the bar above should move when you speak. When you&apos;re ready, we&apos;ll
                count you in and play the song.
              </p>
              {error && <ErrorNote msg={error} />}
              <Button onClick={beginCountdown} size="lg" disabled={backingState !== "ready"} className="w-full sm:w-auto">
                ● Start recording
              </Button>
            </>
          )}

          {phase === "countdown" && (
            <div className="text-center py-6">
              <div className="font-serif" style={{ fontSize: "4rem", color: "var(--gold-700)", lineHeight: 1 }}>{count}</div>
              <p className="text-sm mt-2" style={{ color: "var(--fg3)" }}>Get ready…</p>
            </div>
          )}

          {phase === "recording" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: "var(--crimson-700)" }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--crimson-700)" }} />
                Recording, {formatTime(elapsed)}
              </div>
              <Button onClick={stopRecording} variant="secondary" size="lg" className="w-full sm:w-auto">
                ■ Stop &amp; review
              </Button>
            </div>
          )}
        </div>
      )}

      {(phase === "review" || phase === "submitting") && (
        <div className="space-y-5">
          <h2 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 500, color: "var(--ink-900)" }}>
            Listen back
          </h2>
          <p className="text-sm" style={{ color: "var(--fg2)" }}>
            Here&apos;s your take with the song. Happy with it? Send it in. Or record again.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={reviewPlaying ? stopReview : playReview} variant="secondary">
              {reviewPlaying ? "■ Stop" : "▶ Play with song"}
            </Button>
            <Button onClick={discard} variant="ghost" disabled={phase === "submitting"}>
              ↺ Record again
            </Button>
          </div>
          {error && <ErrorNote msg={error} />}
          <Button onClick={submit} size="lg" disabled={phase === "submitting"} className="w-full sm:w-auto">
            {phase === "submitting" ? "Sending…" : "Add my voice ✦"}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ─────────────── small presentational helpers ─────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
    >
      {children}
    </div>
  );
}

function Meter({ level, recording }: { level: number; recording: boolean }) {
  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--parch-200)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-75"
          style={{
            width: `${Math.round(level * 100)}%`,
            background: recording ? "var(--crimson-700)" : "var(--gold-500)",
          }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: "var(--fg3)" }}>Mic level</p>
    </div>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return (
    <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}>
      {msg}
    </p>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--ink-800)" }}>
        {label}
        {required && <span style={{ color: "var(--crimson-700)" }} aria-hidden> *</span>}
      </label>
      {hint && <p className="text-xs mb-1.5" style={{ color: "var(--fg3)" }}>{hint}</p>}
      {children}
    </div>
  );
}
