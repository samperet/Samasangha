"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import LokaListen from "./LokaListen";

type Phase = "form" | "listen" | "record" | "done";

type WidgetHandle = {
  record: () => Promise<boolean>;
  stopRecording: () => void;
  destroy: () => void;
} | null;
type TakeMeta = { name?: string; loopMs?: number; mime?: string; sizeBytes?: number };

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function mimeExt(mime: string): string {
  if (/mp4|m4a|aac/.test(mime)) return "mp4";
  if (/ogg/.test(mime)) return "ogg";
  return "webm";
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

export default function LokaWidgetRecorder({ goal }: { goal: number }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState({ name: "", email: "", voiceType: "", consent: false });
  const [error, setError] = useState("");
  const [showHeadphones, setShowHeadphones] = useState(false);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<WidgetHandle>(null);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Send a finished take (the widget hands it back on stop) to the API, using
  // the details gathered in the form.
  const uploadTake = useCallback(async (blob: Blob, meta: TakeMeta) => {
    setRecording(false);
    setSubmitting(true);
    setError("");
    const f = formRef.current;
    try {
      const durationMs = (await blobDurationMs(blob)) || meta.loopMs || 0;
      const ext = mimeExt(blob.type);
      const file = new File([blob], `loka-${Date.now()}.${ext}`, { type: blob.type });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", f.name.trim());
      fd.append("email", f.email.trim());
      fd.append("voiceType", f.voiceType);
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
      setShowNotify(true);
      setPhase("done");
    } catch {
      setError("We couldn't send your prayer. Please check your connection and try again.");
      setSubmitting(false);
    }
  }, []);

  // Mount the singalong widget (subtitles only — we drive recording ourselves)
  // once we're on the recording step.
  useEffect(() => {
    if (phase !== "record" || !hostRef.current) return;
    let cancelled = false;
    const host = hostRef.current;
    import("./lokah-recorder.js")
      .then(({ createLokahRecorder }) => {
        if (cancelled) return;
        handleRef.current = createLokahRecorder(host, {
          loopUrl: "/lokah/loop.mp3",
          ballUrl: "/lokah/ball.png",
          showControls: false, // our own Begin / Stop buttons drive it
          collectName: false,
          loopOnce: true, // one pass, then auto-stop
          onComplete: (blob: Blob, meta: TakeMeta) => uploadTake(blob, meta),
          onError: () => {
            setRecording(false);
            setError("We couldn't reach your microphone. Please allow it, then try again.");
          },
        });
      })
      .catch(() => setError("The singalong couldn't load. Please refresh and try again."));
    return () => {
      cancelled = true;
      try {
        handleRef.current?.destroy();
      } catch {
        /* noop */
      }
      handleRef.current = null;
    };
  }, [phase, uploadTake]);

  function toRecording() {
    setError("");
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!form.voiceType) return setError("Please choose lower or higher.");
    if (!form.consent) return setError("Please tick the box to include your voice.");
    if (form.email.trim() && !emailRe.test(form.email.trim())) {
      return setError("That email doesn't look right. You can also leave it blank.");
    }
    setPhase("listen");
  }

  async function beginRecording() {
    setShowHeadphones(false);
    setError("");
    const ok = await handleRef.current?.record();
    if (ok) setRecording(true);
    else setError("We couldn't start recording. Please allow your microphone and try again.");
  }

  function stopNow() {
    handleRef.current?.stopRecording();
  }

  /* UI */

  if (phase === "done") {
    return (
      <>
        <Card>
          <div className="text-center py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/loka-mandala.png" alt="" aria-hidden className="mx-auto mb-4" style={{ width: 120, height: 120 }} />
            <h2 className="font-serif mb-3" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--ink-900)" }}>
              Thank you. Your prayer is received.
            </h2>
            <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "var(--fg2)", maxWidth: "34ch", margin: "0 auto" }}>
              Your voice has joined the others. Bless you for singing.
            </p>
          </div>
        </Card>
        {showNotify && <NotifyPopup hasEmail={!!form.email.trim()} onClose={() => setShowNotify(false)} />}
      </>
    );
  }

  return (
    <Card>
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
          <BigButton onClick={toRecording}>Continue</BigButton>
        </div>
      )}

      {phase === "listen" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif mb-2" style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--ink-900)" }}>
              Listen to the song
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg2)" }}>
              Take a few minutes to listen all the way through. Follow the words as they scroll past
              the marker, and hum along quietly until it feels familiar. When you are ready, record
              your voice.
            </p>
          </div>

          <LokaListen />

          <BigButton onClick={() => setPhase("record")}>I&apos;m ready to record</BigButton>
        </div>
      )}

      {phase === "record" && (
        <div className="space-y-6">
          <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--fg2)" }}>
            {recording
              ? "Sing along with the words as they pass the marker. The recording stops on its own at the end of the song."
              : submitting
                ? "Sending your voice…"
                : "When you are ready, begin recording and sing along with the words as they scroll by."}
          </p>

          {/* The Lokah Choir singalong (subtitles + bouncing marker) mounts here */}
          <div ref={hostRef} />

          {recording ? (
            <div className="space-y-4">
              <div
                className="flex items-center justify-center gap-2.5"
                style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--crimson-700)" }}
              >
                <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--crimson-700)" }} />
                Recording your prayer
              </div>
              <button
                onClick={stopNow}
                className="w-full py-3 rounded-xl border font-semibold transition-colors"
                style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)", fontSize: "1.05rem" }}
              >
                Stop and send now
              </button>
            </div>
          ) : (
            !submitting && <BigButton onClick={() => setShowHeadphones(true)}>Begin recording</BigButton>
          )}

          {error && <ErrorNote msg={error} />}
        </div>
      )}

      <p className="text-center mt-7" style={{ fontSize: "0.9rem", color: "var(--fg3)" }}>
        Every voice is welcome. Together we are gathering {goal}.
      </p>

      {showHeadphones && (
        <HeadphonesPopup onCancel={() => setShowHeadphones(false)} onConfirm={beginRecording} />
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

function HeadphonesPopup({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal onClose={onCancel} labelledBy="loka-headphones-title">
      <div aria-hidden style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "0.5rem" }}>
        🎧
      </div>
      <h3 id="loka-headphones-title" className="font-serif mb-3" style={{ fontSize: "1.7rem", fontWeight: 600, color: "var(--ink-900)" }}>
        Please put on headphones
      </h3>
      <p className="mb-6" style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--fg2)" }}>
        Headphones keep the song from bleeding into your microphone, so your
        voice records cleanly. Then sing along gently — there is no wrong way to
        do this.
      </p>
      <BigButton onClick={onConfirm}>I have my headphones on, begin</BigButton>
      <button onClick={onCancel} className="w-full py-3 mt-2 font-medium" style={{ color: "var(--fg3)", fontSize: "1.05rem" }}>
        Not yet
      </button>
    </Modal>
  );
}

function NotifyPopup({ hasEmail, onClose }: { hasEmail: boolean; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="loka-notify-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/loka-mandala.png" alt="" aria-hidden className="mx-auto mb-4" style={{ width: 96, height: 96 }} />
      <h3 id="loka-notify-title" className="font-serif mb-3" style={{ fontSize: "1.7rem", fontWeight: 600, color: "var(--ink-900)" }}>
        Thank you for your voice
      </h3>
      <p className="mb-6" style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--fg2)" }}>
        When all the voices are gathered and the prayer is complete,{" "}
        {hasEmail
          ? "you'll receive the final song by email."
          : "the final song will be shared here — leave your email next time and we'll send it to you."}
      </p>
      <BigButton onClick={onClose}>Close</BigButton>
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl font-semibold transition-all duration-150 disabled:opacity-50"
      style={{
        padding: "1.1rem 1.5rem",
        fontSize: "1.25rem",
        background: "var(--gold-600)",
        color: "var(--fg-on-gold)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </button>
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
