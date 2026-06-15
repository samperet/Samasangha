"use client";

import { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    paypal?: any;
  }
}

type Participant = { name: string; isChild: boolean; dietary: string };
type Status = "idle" | "loading" | "success" | "waitlisted" | "checkPending" | "error";

type Props = {
  slug: string;
  isFull: boolean;
  spotsLeft: number | null;
  pricingType: "FREE" | "FIXED" | "SLIDING";
  perPersonMinCents: number;
  perPersonMaxCents: number;
  kidsDiscountPercent: number;
  paypalClientId: string | null;
};

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function loadPaypal(clientId: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-paypal]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    s.dataset.paypal = "true";
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function RegistrationForm({
  slug,
  isFull,
  spotsLeft,
  pricingType,
  perPersonMinCents,
  perPersonMaxCents,
  kidsDiscountPercent,
  paypalClientId,
}: Props) {
  const isFree = pricingType === "FREE";
  const factor = 1 - kidsDiscountPercent / 100;
  const personCents = (isChild: boolean, per: number) => (isChild ? Math.round(per * factor) : per);

  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", isChild: false, dietary: "" },
  ]);
  const [method, setMethod] = useState<"PAYPAL" | "CHECK">(paypalClientId ? "PAYPAL" : "CHECK");
  const [checkPromise, setCheckPromise] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const totalMinCents = participants.reduce((s, p) => s + personCents(p.isChild, perPersonMinCents), 0);
  const totalMaxCents = participants.reduce((s, p) => s + personCents(p.isChild, perPersonMaxCents), 0);

  // Sliding-scale chosen amount, in whole dollars.
  const minD = Math.round(totalMinCents / 100);
  const maxD = Math.round(totalMaxCents / 100);
  const [amountD, setAmountD] = useState(Math.round((minD + maxD) / 2) || 0);
  const chosenD = Math.min(maxD, Math.max(minD, amountD));

  const amountCents =
    isFree ? 0 : pricingType === "FIXED" ? totalMinCents : chosenD * 100;

  // The whole party can't fit → everyone goes to the waitlist, no payment.
  const effectiveFull = isFull || (spotsLeft !== null && participants.length > spotsLeft);
  const needsPayment = !isFree && !effectiveFull && amountCents > 0;

  // Keep the latest payload available to the PayPal button callbacks.
  const payload = {
    name: contact.name.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim() || undefined,
    notes: contact.notes.trim() || undefined,
    participants: participants.map((p) => ({
      name: p.name.trim(),
      isChild: p.isChild,
      dietary: p.dietary.trim() || undefined,
    })),
    amountCents,
  };
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const bookingIdRef = useRef<string | null>(null);
  const paypalContainer = useRef<HTMLDivElement>(null);

  function validate(): string | null {
    if (!contact.name.trim()) return "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email.trim())) return "Please enter a valid email.";
    if (participants.length === 0) return "Add at least one participant.";
    if (participants.some((p) => !p.name.trim())) return "Please name every participant.";
    return null;
  }

  function addParticipant() {
    setParticipants((ps) => [...ps, { name: "", isChild: false, dietary: "" }]);
  }
  function removeParticipant(i: number) {
    setParticipants((ps) => ps.filter((_, idx) => idx !== i));
  }
  function setParticipant(i: number, patch: Partial<Participant>) {
    setParticipants((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  // Submit free / check / waitlist registrations (PayPal handled separately).
  async function submitNonPaypal(paymentMethod: "NONE" | "CHECK") {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setStatus("error");
      return;
    }
    if (paymentMethod === "CHECK" && !checkPromise) {
      setErrorMsg("Please confirm you'll mail a check to continue.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadRef.current, paymentMethod }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(typeof json.error === "string" ? json.error : "Something went wrong. Please try again.");
        return;
      }
      if (json.status === "waitlisted") setStatus("waitlisted");
      else if (json.status === "check") setStatus("checkPending");
      else setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  // Render PayPal buttons when that method is active and applicable.
  useEffect(() => {
    if (method !== "PAYPAL" || !paypalClientId || !needsPayment) return;
    let cancelled = false;
    let buttons: any;
    loadPaypal(paypalClientId)
      .then((pp) => {
        if (cancelled || !paypalContainer.current) return;
        paypalContainer.current.innerHTML = "";
        buttons = pp.Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },
          createOrder: async () => {
            const err = validate();
            if (err) {
              setErrorMsg(err);
              setStatus("error");
              throw new Error(err);
            }
            setStatus("loading");
            setErrorMsg("");
            const res = await fetch(`/api/events/${slug}/paypal/create-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadRef.current),
            });
            const json = await res.json();
            if (!res.ok) {
              setStatus("error");
              setErrorMsg(typeof json.error === "string" ? json.error : "Could not start payment.");
              throw new Error("create-order failed");
            }
            bookingIdRef.current = json.bookingId;
            setStatus("idle");
            return json.orderId;
          },
          onApprove: async (data: any) => {
            setStatus("loading");
            const res = await fetch(`/api/events/${slug}/paypal/capture`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, bookingId: bookingIdRef.current }),
            });
            const json = await res.json();
            if (!res.ok) {
              setStatus("error");
              setErrorMsg(typeof json.error === "string" ? json.error : "Payment could not be completed.");
              return;
            }
            setStatus("success");
          },
          onCancel: () => setStatus("idle"),
          onError: () => {
            setStatus("error");
            setErrorMsg("Payment failed. Please try again or pay by check.");
          },
        });
        buttons.render(paypalContainer.current);
      })
      .catch(() => setErrorMsg("Could not load PayPal. You can pay by check instead."));
    return () => {
      cancelled = true;
      try {
        buttons?.close?.();
      } catch {
        /* noop */
      }
    };
  }, [method, paypalClientId, needsPayment, slug]);

  /* ---------- Confirmation screens ---------- */
  if (status === "success") {
    return (
      <Confirmation
        title="Registration confirmed."
        body="We've sent a confirmation to your email. We look forward to gathering with you."
      />
    );
  }
  if (status === "checkPending") {
    return (
      <Confirmation
        title="Almost there."
        body="We've emailed you the details for mailing your check. Your spot is held, but your registration is not complete until your check is received."
      />
    );
  }
  if (status === "waitlisted") {
    return (
      <Confirmation
        title="You're on the waitlist."
        body="We'll contact you as soon as a spot opens up. Thank you for your patience."
      />
    );
  }

  /* ---------- Form ---------- */
  return (
    <div className="space-y-8">
      {/* Your details */}
      <section className="space-y-4">
        <SectionHeading n={1} title="Your details" />
        <Field label="Your name" required>
          <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Fatima al-Rashid" autoComplete="name" />
        </Field>
        <Field label="Email address" required>
          <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Phone number" hint="Optional, helpful for logistics">
          <Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1 (617) 555-0100" autoComplete="tel" />
        </Field>
      </section>

      {/* Participants */}
      <section className="space-y-4">
        <SectionHeading n={2} title="Who's attending?" />
        {kidsDiscountPercent > 0 && (
          <p className="text-xs" style={{ color: "var(--fg3)" }}>
            Mark anyone 18 &amp; under to apply the {kidsDiscountPercent}% discount.
          </p>
        )}
        <div className="space-y-3">
          {participants.map((p, i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-3"
              style={{ background: "#fff", border: "1px solid var(--surface-border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--fg3)" }}>
                  Participant {i + 1}
                </span>
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(i)}
                    className="text-xs"
                    style={{ color: "var(--crimson-700)" }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <Input
                value={p.name}
                onChange={(e) => setParticipant(i, { name: e.target.value })}
                placeholder="Full name"
              />
              <Input
                value={p.dietary}
                onChange={(e) => setParticipant(i, { dietary: e.target.value })}
                placeholder="Dietary needs (optional), e.g. vegetarian, no nuts"
              />
              {kidsDiscountPercent > 0 && (
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--fg2)" }}>
                  <input
                    type="checkbox"
                    checked={p.isChild}
                    onChange={(e) => setParticipant(i, { isChild: e.target.checked })}
                    className="accent-[#c4922b]"
                  />
                  Child (18 &amp; under)
                </label>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addParticipant}
          className="text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors"
          style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)" }}
        >
          + Add another participant
        </button>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <SectionHeading n={3} title="Anything else?" />
        <Field label="Notes or questions" hint="Accessibility, childcare, scholarship inquiry, etc.">
          <Textarea value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} rows={3} placeholder="Share anything that would help us welcome you well." />
        </Field>
      </section>

      {/* Waitlist path */}
      {effectiveFull ? (
        <section className="space-y-4">
          <div
            className="text-sm px-4 py-3 rounded-lg"
            style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}
          >
            {isFull
              ? "This event is full. Add your party to the waitlist and we'll be in touch if space opens."
              : `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remain, so your whole party will join the waitlist.`}
          </div>
          {status === "error" && <ErrorNote msg={errorMsg} />}
          <Button onClick={() => submitNonPaypal("NONE")} size="lg" disabled={status === "loading"} className="w-full sm:w-auto">
            {status === "loading" ? "Submitting…" : "Join waitlist"}
          </Button>
        </section>
      ) : (
        <>
          {/* Total + payment */}
          {needsPayment && (
            <section className="space-y-4">
              <SectionHeading n={4} title="Payment" />

              {pricingType === "SLIDING" ? (
                <div
                  className="rounded-xl p-5"
                  style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
                >
                  <p className="text-sm mb-3" style={{ color: "var(--fg2)" }}>
                    This event is offered on a sliding scale. Choose the total that feels right for your party.
                  </p>
                  <div className="text-center mb-3">
                    <span className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 500, color: "var(--gold-700)" }}>
                      ${chosenD}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minD}
                    max={maxD}
                    step={5}
                    value={chosenD}
                    onChange={(e) => setAmountD(Number(e.target.value))}
                    className="w-full accent-[#c4922b]"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--fg3)" }}>
                    <span>${minD}</span>
                    <span>${maxD}</span>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl p-5 flex items-baseline justify-between"
                  style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
                >
                  <span className="text-sm" style={{ color: "var(--fg2)" }}>
                    Total for {participants.length} participant{participants.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 500, color: "var(--gold-700)" }}>
                    {dollars(amountCents)}
                  </span>
                </div>
              )}

              {/* Method selector */}
              <div className="flex flex-col sm:flex-row gap-3">
                {paypalClientId && (
                  <MethodButton
                    active={method === "PAYPAL"}
                    onClick={() => setMethod("PAYPAL")}
                    title="Pay online"
                    subtitle="Credit card or PayPal"
                  />
                )}
                <MethodButton
                  active={method === "CHECK"}
                  onClick={() => setMethod("CHECK")}
                  title="Pay by check"
                  subtitle="Mail a check"
                />
              </div>

              {status === "error" && <ErrorNote msg={errorMsg} />}

              {method === "PAYPAL" && paypalClientId ? (
                <div>
                  {status === "loading" && (
                    <p className="text-sm mb-2" style={{ color: "var(--fg3)" }}>Processing…</p>
                  )}
                  <div ref={paypalContainer} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="text-sm rounded-lg px-4 py-3 leading-relaxed"
                    style={{ background: "var(--gold-100)", color: "var(--ink-800)" }}
                  >
                    Mail a check for <strong>{dollars(amountCents)}</strong>. After you submit, we'll email you the
                    mailing address and payee details. <strong>Your registration is not complete until your check is
                    received.</strong>
                  </div>
                  <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: "var(--fg2)" }}>
                    <input
                      type="checkbox"
                      checked={checkPromise}
                      onChange={(e) => setCheckPromise(e.target.checked)}
                      className="accent-[#c4922b] mt-0.5"
                    />
                    By selecting this option, I promise to mail a check for {dollars(amountCents)}, and understand my
                    spot is not secured until it arrives.
                  </label>
                  <Button onClick={() => submitNonPaypal("CHECK")} size="lg" disabled={status === "loading"} className="w-full sm:w-auto">
                    {status === "loading" ? "Submitting…" : "Complete registration"}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Free events */}
          {!needsPayment && (
            <section className="space-y-3">
              {status === "error" && <ErrorNote msg={errorMsg} />}
              <Button onClick={() => submitNonPaypal("NONE")} size="lg" disabled={status === "loading"} className="w-full sm:w-auto">
                {status === "loading" ? "Submitting…" : "Complete registration"}
              </Button>
              <p className="text-xs" style={{ color: "var(--fg3)" }}>
                A confirmation will be sent to your email address.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex items-center justify-center rounded-full text-xs font-semibold"
        style={{ width: 22, height: 22, background: "var(--gold-100)", color: "var(--gold-700)" }}
      >
        {n}
      </span>
      <h2 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--ink-900)" }}>
        {title}
      </h2>
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 text-left rounded-xl px-4 py-3 border transition-colors"
      style={
        active
          ? { borderColor: "var(--gold-500)", background: "var(--gold-100)" }
          : { borderColor: "var(--surface-border)", background: "#fff" }
      }
    >
      <span className="block text-sm font-semibold" style={{ color: "var(--ink-800)" }}>{title}</span>
      <span className="block text-xs" style={{ color: "var(--fg3)" }}>{subtitle}</span>
    </button>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return (
    <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}>
      {msg}
    </p>
  );
}

function Confirmation({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-4xl mb-4">✦</div>
      <h2 className="font-serif mb-3" style={{ fontSize: "1.75rem", fontWeight: 500, color: "var(--ink-900)" }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)", maxWidth: "42ch", margin: "0 auto" }}>
        {body}
      </p>
    </div>
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
