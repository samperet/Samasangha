"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FIELD_STYLE: React.CSSProperties = {
  background: "var(--parch-50)",
  border: "1px solid var(--surface-border)",
  color: "var(--ink-900)",
};

export default function AddProfileForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [photoName, setPhotoName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/mureeds", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    setSubmitting(false);
    if (res.ok) {
      formRef.current?.reset();
      setPhotoName("");
      setDone(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong, please try again.");
    }
  }

  return (
    <section
      className="rounded-2xl px-7 py-8"
      style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
      aria-label="Add yourself to the directory"
    >
      <h2 className="font-serif mb-1" style={{ fontSize: "1.5rem", fontWeight: 500, color: "var(--ink-900)" }}>
        Add yourself
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--fg2)" }}>
        Your listing is visible only to mureeds who hold the password.
      </p>

      {done ? (
        <p className="text-sm font-medium" style={{ color: "var(--gold-700)" }}>
          Thank you, you&rsquo;re in the directory. ♥
        </p>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium" style={{ color: "var(--fg2)" }}>Name *</span>
              <input
                name="name" required maxLength={120}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={FIELD_STYLE}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium" style={{ color: "var(--fg2)" }}>Location *</span>
              <input
                name="location" required maxLength={160} placeholder="Town, State / Country"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={FIELD_STYLE}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium" style={{ color: "var(--fg2)" }}>Email *</span>
              <input
                name="email" type="email" required maxLength={200}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={FIELD_STYLE}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium" style={{ color: "var(--fg2)" }}>Phone</span>
              <input
                name="phone" type="tel" maxLength={40}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={FIELD_STYLE}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium" style={{ color: "var(--fg2)" }}>Photo</span>
            <span
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer"
              style={FIELD_STYLE}
            >
              <span
                className="shrink-0 rounded-md px-3 py-1 text-xs font-semibold"
                style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
              >
                Choose image
              </span>
              <span style={{ color: photoName ? "var(--ink-900)" : "var(--fg3)" }}>
                {photoName || "A friendly picture of you (optional)"}
              </span>
              <input
                name="photo" type="file" accept="image/*" className="sr-only"
                onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
              />
            </span>
          </label>

          {error && (
            <p className="text-sm" style={{ color: "var(--crimson-700)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-60"
            style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
          >
            {submitting ? "Adding…" : "Add me to the directory"}
          </button>
        </form>
      )}
    </section>
  );
}
