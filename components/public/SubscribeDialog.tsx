"use client";

import { useEffect, useRef, useState } from "react";
import SubscribeForm from "./SubscribeForm";

/**
 * A button that opens the newsletter signup in a modal.
 *
 * Built on the native <dialog>, which brings focus trapping, Escape to close
 * and an inert background with no code of our own — worth having on a site
 * whose visitors are largely using keyboards and screen readers.
 */
export default function SubscribeDialog({
  cta = "Sign up for reminders",
  title = "Join the mailing list",
  blurb,
}: {
  cta?: string;
  title?: string;
  blurb?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // showModal() leaves the page behind it scrollable, which reads as the modal
  // sliding about when you scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function show() {
    ref.current?.showModal();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex h-12 items-center justify-center rounded-lg px-7 text-sm font-semibold"
        style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
      >
        {cta}
      </button>

      <dialog
        ref={ref}
        className="sama-dialog w-full max-w-md rounded-2xl p-0"
        aria-labelledby="subscribe-dialog-title"
        onClose={() => setOpen(false)}
        // A click landing on the dialog element itself is a click on the
        // backdrop — the content sits in the div below.
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div
          className="relative p-8"
          style={{
            background: "var(--parch-50)",
            border: "1px solid var(--surface-border)",
            borderRadius: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-4 text-2xl leading-none"
            style={{ color: "var(--fg3)" }}
          >
            ×
          </button>

          <h2
            id="subscribe-dialog-title"
            className="font-serif mb-2"
            style={{ fontSize: "1.5rem", fontWeight: 500, color: "var(--ink-900)" }}
          >
            {title}
          </h2>
          {blurb && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--fg2)" }}>
              {blurb}
            </p>
          )}

          <SubscribeForm variant="dialog" cta="Sign me up" />
        </div>
      </dialog>
    </>
  );
}
