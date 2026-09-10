"use client";

import { useId, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Mailing list signup. Posts to /api/subscribe, which adds the person to the
 * Mailchimp audience with their name in the FNAME and LNAME merge fields.
 *
 * Two shapes: "panel" sits in the page (the Contact page), "footer" matches the
 * stacked full-width buttons in the site footer.
 */
export default function SubscribeForm({
  variant = "panel",
  cta = "Subscribe",
}: {
  variant?: "panel" | "footer";
  cta?: string;
}) {
  const id = useId();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "Thank you! You're on the list.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  const isFooter = variant === "footer";

  if (status === "success") {
    return (
      <p
        role="status"
        className={isFooter ? "w-full max-w-xs text-sm font-semibold" : "font-medium"}
        style={{ color: isFooter ? "var(--ink-900)" : "var(--gold-900)" }}
      >
        {message}
      </p>
    );
  }

  // The honeypot: off-screen rather than display:none, which some bots skip.
  const honeypot = (
    <div aria-hidden style={{ position: "absolute", left: "-9999px" }}>
      <label htmlFor={`${id}-company`}>Company</label>
      <input
        id={`${id}-company`}
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
    </div>
  );

  const error = status === "error" ? message : "";

  if (isFooter) {
    // The footer column is narrow, so the two names share a row and the address
    // takes its own — three rows rather than four above the button.
    const field = "h-12 w-full rounded-lg px-4 text-sm";
    const fieldStyle = {
      background: "var(--parch-50)",
      border: "1px solid var(--gold-400)",
      color: "var(--ink-900)",
    };
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-2">
        <div className="flex gap-2">
          <label htmlFor={`${id}-first`} className="sr-only">
            First name
          </label>
          <input
            id={`${id}-first`}
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={`${field} min-w-0 flex-1`}
            style={fieldStyle}
          />
          <label htmlFor={`${id}-last`} className="sr-only">
            Last name
          </label>
          <input
            id={`${id}-last`}
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={`${field} min-w-0 flex-1`}
            style={fieldStyle}
          />
        </div>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={field}
          style={fieldStyle}
        />
        {honeypot}
        <button
          type="submit"
          disabled={status === "loading"}
          className="footer-cta inline-flex h-12 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : cta}
        </button>
        <p role="status" aria-live="polite" className="text-sm" style={{ color: "var(--crimson-700)" }}>
          {error}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label htmlFor={`${id}-first`} className="sr-only">
            First name
          </label>
          <Input
            id={`${id}-first`}
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`${id}-last`} className="sr-only">
            Last name
          </label>
          <Input
            id={`${id}-last`}
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <Input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {honeypot}
        <Button type="submit" disabled={status === "loading"} className="shrink-0">
          {status === "loading" ? "…" : cta}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="text-sm mt-2" style={{ color: "var(--crimson-700)" }}>
        {error}
      </p>
    </form>
  );
}
