"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import { audioBufferToWav, fetchAudioBuffer } from "./loka-shared";

type Phase = "capture" | "form" | "done";
type CapStatus = "idle" | "countdown" | "recording" | "recorded";

type WidgetHandle = {
  play: () => void;
  pause: () => void;
  prepare: () => Promise<boolean>;
  unlock: () => void;
  record: () => Promise<boolean>;
  stopRecording: () => void;
  destroy: () => void;
} | null;
type TakeMeta = { name?: string; loopMs?: number; mime?: string; sizeBytes?: number; hasVideo?: boolean };

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function mimeExt(mime: string): string {
  if (/wav/.test(mime)) return "wav";
  if (/mp4|m4a|aac/.test(mime)) return "mp4";
  if (/ogg/.test(mime)) return "ogg";
  return "webm";
}

// Render an AudioBuffer at a fixed gain, so the singer's chosen volume is baked
// into the file they submit.
async function renderAtVolume(buf: AudioBuffer, vol: number): Promise<AudioBuffer> {
  const oac = new OfflineAudioContext(buf.numberOfChannels, buf.length, buf.sampleRate);
  const src = oac.createBufferSource();
  src.buffer = buf;
  const g = oac.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(oac.destination);
  src.start(0);
  return oac.startRendering();
}

// Best-effort take length, used only for admin display.
async function blobDurationMs(blob: Blob): Promise<number> {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    ctx.close().catch(() => {});
    return Math.round(buf.duration * 1000);
  } catch {
    return 0;
  }
}

export default function LokaWidgetRecorder() {
  const [phase, setPhase] = useState<Phase>("capture");
  const [capStatus, setCapStatus] = useState<CapStatus>("idle");
  const [countdownN, setCountdownN] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", voiceType: "", consent: false });
  const [error, setError] = useState("");
  const [showHeadphones, setShowHeadphones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withVideo, setWithVideo] = useState(true); // capture camera too, unless turned off
  const [takeIsVideo, setTakeIsVideo] = useState(false); // the captured take has picture
  const [takeUrl, setTakeUrl] = useState(""); // object URL for a video take's playback

  // Review of the captured take (played back together with the song).
  const [reviewReady, setReviewReady] = useState(false);
  const [reviewPlaying, setReviewPlaying] = useState(false);
  const [takeVolume, setTakeVolume] = useState(1); // the singer's own volume, 0–1.5

  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<WidgetHandle>(null);
  const takeBlobRef = useRef<Blob | null>(null);
  const takeMetaRef = useRef<TakeMeta>({});
  const countdownTimerRef = useRef(0);
  const resettingRef = useRef(false); // ignore the take from a reset-triggered stop
  const submitAfterStopRef = useRef(false); // jump to form after a submit-triggered stop
  const takeVideoRef = useRef<HTMLVideoElement | null>(null); // the recorded video, for review
  const mediaElSrcRef = useRef<MediaElementAudioSourceNode | null>(null); // routes that video's sound

  // Review playback engine (loop + take, with the singer's volume on the take).
  const reviewCtxRef = useRef<AudioContext | null>(null);
  const loopBufRef = useRef<AudioBuffer | null>(null);
  const takeBufRef = useRef<AudioBuffer | null>(null);
  const reviewSrcRef = useRef<AudioBufferSourceNode[]>([]);
  const takeGainRef = useRef<GainNode | null>(null);
  const takeVolumeRef = useRef(1);
  useEffect(() => {
    takeVolumeRef.current = takeVolume;
  }, [takeVolume]);

  const ensureReviewCtx = useCallback(() => {
    if (!reviewCtxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      reviewCtxRef.current = new AC();
    }
    return reviewCtxRef.current;
  }, []);

  const stopReview = useCallback(() => {
    reviewSrcRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* noop */
      }
    });
    reviewSrcRef.current = [];
    const v = takeVideoRef.current;
    if (v) {
      try {
        v.pause();
      } catch {
        /* noop */
      }
    }
    setReviewPlaying(false);
  }, []);

  // Receive a finished take from the widget (auto-stop at loop end, or a manual
  // stop from Reset / Submit).
  const onTake = useCallback((blob: Blob, meta: TakeMeta) => {
    if (resettingRef.current) {
      resettingRef.current = false;
      return; // a reset is restarting the count-in; discard this take
    }
    takeBlobRef.current = blob;
    takeMetaRef.current = meta || {};
    const isVid = !!meta?.hasVideo || (blob.type || "").startsWith("video");
    setTakeIsVideo(isVid);
    // A fresh take means any MediaElementSource bound to the old <video> is stale.
    mediaElSrcRef.current = null;
    setTakeUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return isVid ? URL.createObjectURL(blob) : "";
    });
    setCapStatus("recorded");
    if (submitAfterStopRef.current) {
      submitAfterStopRef.current = false;
      setPhase("form");
    }
  }, []);

  // Mount the singalong widget while we're capturing (sampling + recording).
  useEffect(() => {
    if (phase !== "capture" || !hostRef.current) return;
    let cancelled = false;
    const host = hostRef.current;
    import("./lokah-recorder.js")
      .then(({ createLokahRecorder }) => {
        if (cancelled) return;
        handleRef.current = createLokahRecorder(host, {
          loopUrl: "/lokah/loop.mp3",
          ballUrl: "/lokah/ball.png",
          showControls: false, // our own play / record / reset / submit buttons drive it
          collectName: false,
          loopOnce: true, // one pass, then auto-stop
          withVideo, // capture the camera too, unless the singer turned it off
          onComplete: (blob: Blob, meta: TakeMeta) => onTake(blob, meta),
          onError: () => {
            setCapStatus("idle");
            setError("We couldn't reach your microphone. Please allow it, then try again.");
          },
        });
      })
      .catch(() => setError("The singalong couldn't load. Please refresh and try again."));
    return () => {
      cancelled = true;
      window.clearInterval(countdownTimerRef.current);
      try {
        handleRef.current?.destroy();
      } catch {
        /* noop */
      }
      handleRef.current = null;
    };
  }, [phase, onTake, withVideo]);

  useEffect(() => () => window.clearInterval(countdownTimerRef.current), []);

  // Decode the take (and the loop) for review once a take has been captured.
  useEffect(() => {
    if (capStatus !== "recorded" || !takeBlobRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const ctx = ensureReviewCtx();
        if (!loopBufRef.current) loopBufRef.current = await fetchAudioBuffer(ctx, "/lokah/loop.mp3");
        if (takeIsVideo) {
          // The <video> element carries the take's picture and sound; we only
          // needed the loop buffer above to play underneath it.
          if (!cancelled) setReviewReady(true);
        } else {
          takeBufRef.current = await ctx.decodeAudioData(await takeBlobRef.current!.arrayBuffer());
          if (!cancelled) setReviewReady(true);
        }
      } catch {
        /* review playback just won't be available */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [capStatus, takeIsVideo, ensureReviewCtx]);

  // Tidy up the review context on unmount.
  useEffect(
    () => () => {
      stopReview();
      reviewCtxRef.current?.close().catch(() => {});
    },
    [stopReview]
  );

  async function playReview() {
    const ctx = ensureReviewCtx();
    await ctx.resume();
    const loop = loopBufRef.current;
    if (!loop) return;
    stopReview();
    const t = ctx.currentTime + 0.06;

    const loopSrc = ctx.createBufferSource();
    loopSrc.buffer = loop;
    loopSrc.connect(ctx.destination);
    loopSrc.start(t);
    loopSrc.onended = () => stopReview();
    reviewSrcRef.current = [loopSrc];

    if (takeIsVideo) {
      // Play the recorded video (its own picture + sound) over the loop, routing
      // its audio through a gain node so "Your volume" still applies.
      const v = takeVideoRef.current;
      if (v) {
        if (!mediaElSrcRef.current) {
          try {
            mediaElSrcRef.current = ctx.createMediaElementSource(v);
          } catch {
            /* already bound to this element — reuse below */
          }
        }
        const g = ctx.createGain();
        g.gain.value = takeVolumeRef.current;
        try {
          mediaElSrcRef.current?.disconnect();
        } catch {
          /* noop */
        }
        mediaElSrcRef.current?.connect(g);
        g.connect(ctx.destination);
        takeGainRef.current = g;
        try {
          v.currentTime = 0;
          await v.play();
        } catch {
          /* noop */
        }
      }
    } else {
      const take = takeBufRef.current;
      if (take) {
        const takeSrc = ctx.createBufferSource();
        takeSrc.buffer = take;
        const g = ctx.createGain();
        g.gain.value = takeVolumeRef.current;
        takeSrc.connect(g);
        g.connect(ctx.destination);
        takeSrc.start(t);
        takeGainRef.current = g;
        reviewSrcRef.current = [loopSrc, takeSrc];
      }
    }
    setReviewPlaying(true);
  }

  function onVolumeChange(v: number) {
    setTakeVolume(v);
    const g = takeGainRef.current;
    const ctx = reviewCtxRef.current;
    if (g && ctx) g.gain.setTargetAtTime(v, ctx.currentTime, 0.02);
  }

  function toggleSample() {
    const h = handleRef.current;
    if (!h) return;
    if (playing) {
      h.pause();
      setPlaying(false);
    } else {
      h.play();
      setPlaying(true);
    }
  }

  function startCountdown() {
    window.clearInterval(countdownTimerRef.current);
    setError("");
    setPlaying(false);
    handleRef.current?.pause(); // keep the 3-2-1 count-in silent; the song starts at "go"
    stopReview();
    setReviewReady(false);
    takeBufRef.current = null;
    setCapStatus("countdown");
    setCountdownN(3);
    let n = 3;
    countdownTimerRef.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(countdownTimerRef.current);
        void startRec();
      } else {
        setCountdownN(n);
      }
    }, 1000);
  }

  async function startRec() {
    setCapStatus("recording");
    const ok = await handleRef.current?.record();
    if (!ok) {
      setCapStatus("idle");
      setError("We couldn't start recording. Please allow your microphone and try again.");
    }
  }

  // Headphones confirmed: arm the mic now (so its prompt doesn't interrupt the
  // count-in), then start the 3-2-1 countdown.
  async function confirmHeadphones() {
    // Unlock the loop audio within this click so the post-countdown play() (which
    // fires from a timer) isn't blocked by browser autoplay rules.
    handleRef.current?.unlock();
    setShowHeadphones(false);
    setError("");
    setPlaying(false);
    const ok = await handleRef.current?.prepare();
    if (!ok) {
      setError("We couldn't reach your microphone. Please allow it, then try again.");
      return;
    }
    startCountdown();
  }

  function reset() {
    setError("");
    takeBlobRef.current = null;
    handleRef.current?.pause(); // stop the music immediately
    setPlaying(false);
    if (capStatus === "recording") {
      resettingRef.current = true;
      handleRef.current?.stopRecording();
    }
    startCountdown();
  }

  function cancel() {
    setError("");
    stopReview();
    setReviewReady(false);
    if (capStatus === "recording") {
      resettingRef.current = true; // discard the take from this stop
      handleRef.current?.stopRecording();
    }
    handleRef.current?.pause();
    setPlaying(false);
    takeBlobRef.current = null;
    takeBufRef.current = null;
    setTakeIsVideo(false);
    mediaElSrcRef.current = null;
    setTakeUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setCapStatus("idle");
  }

  function submit() {
    setError("");
    stopReview();
    if (capStatus === "recording") {
      submitAfterStopRef.current = true;
      handleRef.current?.stopRecording(); // onTake then advances to the form
    } else if (takeBlobRef.current) {
      setPhase("form");
    } else {
      setError("Please record your voice first.");
    }
  }

  function recordAgain() {
    stopReview();
    setReviewReady(false);
    takeBlobRef.current = null;
    takeBufRef.current = null;
    setTakeIsVideo(false);
    mediaElSrcRef.current = null;
    setTakeUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setCapStatus("idle");
    setError("");
    setPhase("capture");
  }

  async function submitForm() {
    setError("");
    stopReview();
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!form.voiceType) return setError("Please choose lower or higher.");
    if (!form.consent) return setError("Please tick the box to include your voice.");
    if (form.email.trim() && !emailRe.test(form.email.trim())) {
      return setError("That email doesn't look right. You can also leave it blank.");
    }
    const blob = takeBlobRef.current;
    if (!blob) {
      setError("Your recording was lost. Please record your voice again.");
      recordAgain();
      return;
    }
    setSubmitting(true);
    try {
      // Bake the singer's chosen volume into the track when they changed it.
      // (Audio takes only — a video take is uploaded as captured.)
      let uploadBlob = blob;
      if (!takeIsVideo && Math.abs(takeVolume - 1) > 0.001) {
        try {
          const buf =
            takeBufRef.current ?? (await ensureReviewCtx().decodeAudioData(await blob.arrayBuffer()));
          uploadBlob = audioBufferToWav(await renderAtVolume(buf, takeVolume));
        } catch {
          /* fall back to the original take at full volume */
        }
      }
      const durationMs = (await blobDurationMs(uploadBlob)) || takeMetaRef.current.loopMs || 0;
      const ext = mimeExt(uploadBlob.type);
      const file = new File([uploadBlob], `loka-${Date.now()}.${ext}`, { type: uploadBlob.type });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("voiceType", form.voiceType);
      // The widget records from the top of the loop, so there is no run-in
      // offset or start position to capture.
      fd.append("offsetMs", "0");
      fd.append("startMs", "0");
      fd.append("durationMs", String(durationMs));
      const res = await fetch("/api/loka/recordings", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setPhase("done");
    } catch {
      setError("We couldn't send your prayer. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  /* UI */

  if (phase === "done") {
    return (
      <Card>
        <div className="text-center py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/loka-mandala.png" alt="" aria-hidden className="mx-auto mb-4" style={{ width: 120, height: 120 }} />
          <h2 className="font-serif mb-3" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--ink-900)" }}>
            Thank you for your submission.
          </h2>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "var(--fg2)", maxWidth: "34ch", margin: "0 auto" }}>
            Look for an update in your inbox when the final is released.
          </p>
        </div>
      </Card>
    );
  }

  const busy = capStatus === "countdown" || capStatus === "recording";

  return (
    <Card>
      {phase === "capture" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif mb-2" style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--ink-900)" }}>
              Learn the song first
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg2)" }}>
              Play the song and follow the words as they scroll past the marker. Listen a few times
              to learn it, then record your voice singing along.
            </p>
          </div>

          {/* Play the song — above the subtitles */}
          <button
            onClick={toggleSample}
            disabled={busy}
            className="w-full rounded-2xl font-semibold transition-colors disabled:opacity-50"
            style={{
              padding: "1rem 1.5rem",
              fontSize: "1.2rem",
              background: "var(--gold-600)",
              color: "var(--fg-on-gold)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {playing ? "Pause" : "▶  Play the song"}
          </button>

          {/* Subtitles */}
          <div ref={hostRef} />

          {/* Record controls — below the subtitles */}
          {capStatus === "idle" && (
            <div className="space-y-4">
              <VideoToggle on={withVideo} onChange={setWithVideo} />
              <BigButton onClick={() => setShowHeadphones(true)} variant="record">
                {withVideo ? "Click to record video" : "Click to record"}
              </BigButton>
            </div>
          )}

          {capStatus === "countdown" && (
            <div className="text-center py-2">
              <div className="font-serif" style={{ fontSize: "4.5rem", fontWeight: 600, color: "var(--gold-700)", lineHeight: 1 }}>
                {countdownN}
              </div>
              <p style={{ fontSize: "1.2rem", color: "var(--fg2)", marginTop: "0.25rem" }}>Get ready to sing…</p>
            </div>
          )}

          {(capStatus === "recording" || capStatus === "recorded") && (
            <div className="space-y-4">
              {capStatus === "recording" ? (
                <div
                  className="flex items-center justify-center gap-2.5"
                  style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--crimson-700)" }}
                >
                  <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--crimson-700)" }} />
                  Recording — sing along
                </div>
              ) : (
                <p className="text-center" style={{ fontSize: "1.1rem", color: "var(--ink-800)" }}>
                  ✓ Your recording is ready. Reset to sing it again, cancel, or review and submit
                  your voice.
                </p>
              )}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="py-4 rounded-2xl border font-semibold transition-colors"
                    style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)", fontSize: "1.15rem" }}
                  >
                    Reset
                  </button>
                  <button
                    onClick={cancel}
                    className="py-4 rounded-2xl border font-semibold transition-colors"
                    style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)", fontSize: "1.15rem" }}
                  >
                    Cancel
                  </button>
                </div>
                <BigButton onClick={submit}>Review</BigButton>
              </div>
            </div>
          )}

          {error && <ErrorNote msg={error} />}
        </div>
      )}

      {phase === "form" && (
        <div className="space-y-6">
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "var(--gold-100)", color: "var(--ink-800)" }}
          >
            <span style={{ fontSize: "1.05rem" }}>✓ Your recording is ready.</span>
            <button
              onClick={recordAgain}
              className="font-semibold shrink-0"
              style={{ fontSize: "0.95rem", color: "var(--gold-700)", textDecoration: "underline" }}
            >
              Record again
            </button>
          </div>

          <div>
            <p className="mb-2 font-semibold" style={{ fontSize: "1rem", color: "var(--ink-800)" }}>
              {takeIsVideo ? "Watch your recording with the song" : "Listen to your recording with the song"}
            </p>
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
            >
              {takeIsVideo && (
                <video
                  ref={takeVideoRef}
                  src={takeUrl}
                  playsInline
                  className="w-full rounded-xl"
                  style={{ maxHeight: 280, background: "#000", transform: "scaleX(-1)" }}
                  onEnded={stopReview}
                />
              )}
              <button
                onClick={reviewPlaying ? stopReview : playReview}
                disabled={!reviewReady}
                className="w-full py-3 rounded-xl border font-semibold transition-colors disabled:opacity-50"
                style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "#fff", fontSize: "1.05rem" }}
              >
                {reviewPlaying ? "Pause" : reviewReady ? `▶  Play ${takeIsVideo ? "it" : "back"} with the song` : "Preparing playback…"}
              </button>
              <label className="flex items-center gap-3" style={{ fontSize: "0.95rem", color: "var(--fg2)" }}>
                <span style={{ width: "6em" }}>Your volume</span>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={takeVolume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: "var(--gold-600)" }}
                  aria-label="Your volume"
                />
                <span className="tabular-nums" style={{ width: "3em", textAlign: "right" }}>
                  {Math.round(takeVolume * 100)}%
                </span>
              </label>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--fg2)" }}>
            Just a few details, then we&apos;ll add your voice to the prayer.
          </p>

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
              placeholder="So we can send you the finished song"
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
          <BigButton onClick={submitForm} disabled={submitting}>
            {submitting ? "Sending" : "Send my voice"}
          </BigButton>
        </div>
      )}

      {showHeadphones && (
        <HeadphonesPopup withVideo={withVideo} onCancel={() => setShowHeadphones(false)} onConfirm={confirmHeadphones} />
      )}
    </Card>
  );
}

/* ── Popups ────────────────────────────────────────────────────────── */

function Modal({ children, onClose, labelledBy }: { children: React.ReactNode; onClose: () => void; labelledBy: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(28,23,16,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-8 text-center"
        style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-lg)", maxWidth: "30rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function HeadphonesPopup({ withVideo, onCancel, onConfirm }: { withVideo: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal onClose={onCancel} labelledBy="loka-headphones-title">
      <div aria-hidden style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "0.5rem" }}>
        {withVideo ? "🎧🎥" : "🎧"}
      </div>
      <h3 id="loka-headphones-title" className="font-serif mb-3" style={{ fontSize: "1.7rem", fontWeight: 600, color: "var(--ink-900)" }}>
        Please put on headphones
      </h3>
      <p className="mb-4" style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--fg2)" }}>
        Headphones keep the song from bleeding into your microphone, so your
        voice records cleanly. Then just relax and sing along.
        {withVideo ? " Your camera will record you too — you'll see yourself on screen." : ""}
      </p>
      <p
        className="mb-6 rounded-xl px-4 py-3"
        style={{ background: "var(--gold-100)", color: "var(--ink-800)", fontSize: "1.05rem", lineHeight: 1.6 }}
      >
        Don&apos;t worry — after you sing you can <strong>listen back</strong>, adjust your volume,
        and <strong>re-record as many times as you like</strong> before you submit.
      </p>
      <BigButton onClick={onConfirm}>I have my headphones on, begin</BigButton>
      <button onClick={onCancel} className="w-full py-3 mt-2 font-medium" style={{ color: "var(--fg3)", fontSize: "1.05rem" }}>
        Not yet
      </button>
    </Modal>
  );
}

/* ── small presentational helpers ──────────────────────────────────── */

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
  variant?: "primary" | "record";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl font-semibold transition-all duration-150 disabled:opacity-50"
      style={{
        padding: "1.1rem 1.5rem",
        fontSize: "1.25rem",
        background: variant === "record" ? "var(--crimson-700)" : "var(--gold-600)",
        color: variant === "record" ? "var(--fg-on-dark)" : "var(--fg-on-gold)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </button>
  );
}

function VideoToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3"
      style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
    >
      <div>
        <p className="font-semibold" style={{ fontSize: "1.1rem", color: "var(--ink-800)" }}>
          {on ? "Record video too" : "Audio only"}
        </p>
        <p style={{ fontSize: "0.95rem", color: "var(--fg2)", lineHeight: 1.4 }}>
          {on ? "Your camera and microphone are used." : "Just your voice — the camera stays off."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Record video too"
        onClick={() => onChange(!on)}
        className="shrink-0 rounded-full transition-colors"
        style={{
          width: 64,
          height: 36,
          padding: 4,
          background: on ? "var(--gold-600)" : "var(--parch-300)",
          display: "flex",
          justifyContent: on ? "flex-end" : "flex-start",
          alignItems: "center",
        }}
      >
        <span
          className="block rounded-full"
          style={{ width: 28, height: 28, background: "#fff", boxShadow: "var(--shadow-sm)" }}
        />
      </button>
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
