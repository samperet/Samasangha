"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";

type Phase = "form" | "record" | "done";

type WidgetHandle = { destroy: () => void } | null;
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
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [takeUrl, setTakeUrl] = useState<string>("");
  const takeBlobRef = useRef<Blob | null>(null);
  const takeMetaRef = useRef<TakeMeta>({});

  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<WidgetHandle>(null);

  // Receive each recorded take from the widget (latest wins; re-recording just
  // replaces it). Kept in a ref so the widget's single callback always sees it.
  const onTake = useCallback((blob: Blob, meta: TakeMeta) => {
    takeBlobRef.current = blob;
    takeMetaRef.current = meta || {};
    setTakeUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setError("");
  }, []);

  // Mount the widget once we're on the recording step.
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
          collectName: false, // we collect the name (and more) in our own form
          onComplete: (blob: Blob, meta: TakeMeta) => onTake(blob, meta),
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
  }, [phase, onTake]);

  useEffect(() => {
    return () => {
      if (takeUrl) URL.revokeObjectURL(takeUrl);
    };
  }, [takeUrl]);

  function toRecording() {
    setError("");
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!form.voiceType) return setError("Please choose lower or higher.");
    if (!form.consent) return setError("Please tick the box to include your voice.");
    if (form.email.trim() && !emailRe.test(form.email.trim())) {
      return setError("That email doesn't look right. You can also leave it blank.");
    }
    setPhase("record");
  }

  async function send() {
    const blob = takeBlobRef.current;
    if (!blob) return setError("Please record your voice first.");
    setSubmitting(true);
    setError("");
    try {
      const durationMs = (await blobDurationMs(blob)) || takeMetaRef.current.loopMs || 0;
      const ext = mimeExt(blob.type);
      const file = new File([blob], `loka-${Date.now()}.${ext}`, { type: blob.type });
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
      setShowPopup(true);
      setPhase("done");
    } catch {
      setError("We couldn't send your prayer. Please check your connection and try again.");
      setSubmitting(false);
    }
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
        {showPopup && <NotifyPopup hasEmail={!!form.email.trim()} onClose={() => setShowPopup(false)} />}
      </>
    );
  }

  return (
    <Card>
      {/* Headphone guidance, always visible */}
      <div className="rounded-2xl p-5 mb-7" style={{ background: "var(--gold-100)", color: "var(--ink-800)" }}>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
          <strong>Please put on headphones first.</strong> Then sing along gently with the words as
          they scroll by. There is no wrong way to do this.
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
              placeholder="So we can notify you when the track is complete"
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
          <BigButton onClick={toRecording}>Continue to the singalong</BigButton>
        </div>
      )}

      {phase === "record" && (
        <div className="space-y-6">
          <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--fg2)" }}>
            Press <strong>Record</strong> and sing along as the words scroll past the marker. Press{" "}
            <strong>Stop</strong> when you are done. You can record as many times as you like.
          </p>

          {/* The Lokah Choir widget mounts here */}
          <div ref={hostRef} />

          {takeUrl && (
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
            >
              <p className="text-center" style={{ fontSize: "1.1rem", color: "var(--fg2)" }}>
                Listen back to your take, then send it on, or record again above.
              </p>
              <audio controls src={takeUrl} className="w-full" />
              <BigButton onClick={send} disabled={submitting}>
                {submitting ? "Sending" : "Send my voice"}
              </BigButton>
            </div>
          )}

          {error && <ErrorNote msg={error} />}
        </div>
      )}

      <p className="text-center mt-7" style={{ fontSize: "0.9rem", color: "var(--fg3)" }}>
        Every voice is welcome. Together we are gathering {goal}.
      </p>
    </Card>
  );
}

/* ── Popup ─────────────────────────────────────────────────────────── */

function NotifyPopup({ hasEmail, onClose }: { hasEmail: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(28,23,16,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loka-notify-title"
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-8 text-center"
        style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-lg)", maxWidth: "30rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/loka-mandala.png" alt="" aria-hidden className="mx-auto mb-4" style={{ width: 96, height: 96 }} />
        <h3 id="loka-notify-title" className="font-serif mb-3" style={{ fontSize: "1.7rem", fontWeight: 600, color: "var(--ink-900)" }}>
          The track is still being gathered
        </h3>
        <p className="mb-6" style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--fg2)" }}>
          The full prayer isn&apos;t finished yet.{" "}
          {hasEmail
            ? "We'll email you the moment the completed track is ready."
            : "Leave your email next time and we'll let you know the moment the completed track is ready."}
        </p>
        <BigButton onClick={onClose}>Close</BigButton>
      </div>
    </div>
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
