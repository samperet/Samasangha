"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { MureedProfile } from "@prisma/client";

export default function MureedForm({ profile }: { profile?: MureedProfile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    location: profile?.location ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    photoUrl: profile?.photoUrl ?? "",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      set("photoUrl", data.url);
    } else {
      setError("Photo upload failed.");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const method = profile ? "PUT" : "POST";
    const url = profile ? `/api/admin/mureeds/${profile.id}` : "/api/admin/mureeds";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }
    router.push("/admin/mureeds");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Name *</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Location *</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Email *</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Phone</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Photo</label>
          <div className="flex items-center gap-4">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover shrink-0"
                style={{ border: "1px solid var(--surface-border)" }}
              />
            ) : (
              <span
                className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-xs"
                style={{ background: "var(--parch-100)", color: "var(--fg3)", border: "1px solid var(--surface-border)" }}
              >
                None
              </span>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : form.photoUrl ? "Replace photo" : "Upload photo"}
              </Button>
              {form.photoUrl && (
                <Button type="button" variant="ghost" onClick={() => set("photoUrl", "")}>
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadPhoto}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : profile ? "Save changes" : "Add to directory"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/mureeds")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
