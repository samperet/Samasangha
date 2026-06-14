"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { NOTIFICATION_PAGES } from "@/lib/notifications";
import type { Notification } from "@prisma/client";

function toLocalInput(d: Date | null | undefined) {
  return d ? new Date(d).toISOString().slice(0, 16) : "";
}

export default function NotificationForm({ notification }: { notification?: Notification }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    message: notification?.message ?? "",
    page: notification?.page ?? NOTIFICATION_PAGES[0].value,
    startTime: toLocalInput(notification?.startTime),
    finishTime: toLocalInput(notification?.finishTime),
    enabled: notification?.enabled ?? true,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.startTime && form.finishTime && new Date(form.finishTime) <= new Date(form.startTime)) {
      setError("Finish time must be after the start time.");
      return;
    }
    setSaving(true);
    const method = notification ? "PUT" : "POST";
    const url = notification ? `/api/admin/notifications/${notification.id}` : "/api/admin/notifications";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startTime: form.startTime || null,
        finishTime: form.finishTime || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError([data.error, data.detail].filter(Boolean).join(" — ") || "Something went wrong.");
      setSaving(false);
      return;
    }
    router.push("/admin/notifications");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Message *</label>
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            rows={4}
            required
            placeholder="e.g. This week's Tuesday class is cancelled."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Show on page *</label>
          <select
            value={form.page}
            onChange={(e) => set("page", e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--surface-border)", color: "var(--fg1)" }}
          >
            {NOTIFICATION_PAGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Start time</label>
            <Input type="datetime-local" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Leave blank to show immediately.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Finish time</label>
            <Input type="datetime-local" value={form.finishTime} onChange={(e) => set("finishTime", e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Leave blank to show indefinitely.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-700)" }}>
          <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
          Enabled
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : notification ? "Save changes" : "Create notification"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/notifications")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
