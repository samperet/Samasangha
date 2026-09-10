"use client";

import { useId, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";
type Variant = "panel" | "footer" | "dialog";

/**
 * Mailing list signup. Posts to /api/subscribe, which adds the person to the
 * Mailchimp audience with their name in the audience's own name merge fields.
 *
 * Three shapes: "panel" sits in the page (the Contact page), "footer" matches
 * the stacked full-width buttons in the site footer, and "dialog" fills the
 * modal opened by SubscribeDialog.
 */
export default function SubscribeForm({
  variant = "panel",
  cta = "Subscribe",
}: {
  variant?: Variant;
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

  const fields = [
    { key: "first", label: "First name", value: firstName, set: setFirstName, type: "text", autoComplete: "given-name" },
    { key: "last", label: "Last name", value: lastName, set: setLastName, type: "text", autoComplete: "family-name" },
    { key: "email", label: "Email address", value: email, set: setEmail, type: "email", autoComplete: "email", placeholder: "your@email.com" },
  ] as const;

  const field = (k: (typeof fields)[number]["key"]) => {
    const f = fields.find((x) => x.key === k)!;
    const common = {
      id: `${id}-${f.key}`,
      type: f.type,
      autoComplete: f.autoComplete,
      placeholder: "placeholder" in f ? f.placeholder : f.label,
      value: f.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => f.set(e.target.value),
      required: true,
      ...(f.type === "email" ? { inputMode: "email" as const } : {}),
    };
    return (
      <>
        <label htmlFor={common.id} className="sr-only">
          {f.label}
        </label>
        {isFooter ? (
          <input
            {...common}
            className="h-12 w-full min-w-0 rounded-lg px-4 text-sm"
            style={{
              background: "var(--parch-50)",
              border: "1px solid var(--gold-400)",
              color: "var(--ink-900)",
            }}
          />
        ) : (
          <Input {...common} />
        )}
      </>
    );
  };

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

  const errorLine = (
    <p role="status" aria-live="polite" className="text-sm mt-2" style={{ color: "var(--crimson-700)" }}>
      {status === "error" ? message : ""}
    </p>
  );

  if (isFooter) {
    // The footer column is narrow, so the two names share a row and the address
    // takes its own — three rows rather than four above the button.
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">{field("first")}</div>
          <div className="flex-1 min-w-0">{field("last")}</div>
        </div>
        {field("email")}
        {honeypot}
        <button
          type="submit"
          disabled={status === "loading"}
          className="footer-cta inline-flex h-12 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : cta}
        </button>
        {errorLine}
      </form>
    );
  }

  if (variant === "dialog") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">{field("first")}</div>
          <div className="flex-1">{field("last")}</div>
        </div>
        {field("email")}
        {honeypot}
        <Button
          type="submit"
          size="lg"
          disabled={status === "loading"}
          className="w-full"
          style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
        >
          {status === "loading" ? "Joining…" : cta}
        </Button>
        {errorLine}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">{field("first")}</div>
        <div className="flex-1">{field("last")}</div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="flex-1">{field("email")}</div>
        {honeypot}
        <Button type="submit" disabled={status === "loading"} className="shrink-0">
          {status === "loading" ? "…" : cta}
        </Button>
      </div>
      {errorLine}
    </form>
  );
}
