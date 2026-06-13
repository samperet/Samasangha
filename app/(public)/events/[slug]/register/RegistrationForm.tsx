"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(1, "Your name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  dietary: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegistrationForm({ slug, isFull }: { slug: string; isFull: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "waitlisted" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setStatus("loading");
    const res = await fetch(`/api/events/${slug}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(typeof json.error === "string" ? json.error : "Something went wrong.");
      return;
    }
    setStatus(json.status === "waitlisted" ? "waitlisted" : "success");
  }

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">✦</div>
        <h2 className="font-serif mb-3" style={{ fontSize: "1.75rem", fontWeight: 500, color: "var(--ink-900)" }}>
          Registration received.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)", maxWidth: "38ch", margin: "0 auto" }}>
          We've sent a confirmation to your email. We look forward to gathering with you.
        </p>
      </div>
    );
  }

  if (status === "waitlisted") {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">✦</div>
        <h2 className="font-serif mb-3" style={{ fontSize: "1.75rem", fontWeight: 500, color: "var(--ink-900)" }}>
          You're on the waitlist.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)", maxWidth: "38ch", margin: "0 auto" }}>
          We'll contact you as soon as a spot opens up. Thank you for your patience.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Your name" required error={errors.name?.message}>
        <Input {...register("name")} placeholder="Fatima al-Rashid" autoComplete="name" />
      </Field>

      <Field label="Email address" required error={errors.email?.message}>
        <Input type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
      </Field>

      <Field label="Phone number" hint="Optional, helpful for retreat logistics">
        <Input type="tel" {...register("phone")} placeholder="+1 (617) 555-0100" autoComplete="tel" />
      </Field>

      <Field label="Dietary needs" hint="Vegetarian, gluten-free, allergies, etc.">
        <Input {...register("dietary")} placeholder="e.g. vegetarian, no nuts" />
      </Field>

      <Field label="Notes or questions" hint="Anything else we should know, accessibility, childcare, scholarship inquiry, etc.">
        <Textarea {...register("notes")} rows={4} placeholder="Share anything that would help us welcome you well." />
      </Field>

      {status === "error" && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}>
          {errorMsg}
        </p>
      )}

      <div className="pt-2">
        <Button type="submit" size="lg" disabled={status === "loading"} className="w-full sm:w-auto">
          {status === "loading"
            ? "Submitting…"
            : isFull
              ? "Join waitlist"
              : "Submit registration"}
        </Button>
        <p className="text-xs mt-3" style={{ color: "var(--fg3)" }}>
          A confirmation will be sent to your email address.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
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
      {error && <p className="text-xs mt-1.5" style={{ color: "var(--crimson-700)" }}>{error}</p>}
    </div>
  );
}
