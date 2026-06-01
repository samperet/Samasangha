"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Event } from "@prisma/client";

export default function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
    location: event?.location ?? "",
    isOnline: event?.isOnline ?? false,
    isRetreat: event?.isRetreat ?? false,
    registerUrl: event?.registerUrl ?? "",
    flyerUrl: event?.flyerUrl ?? "",
    featured: event?.featured ?? false,
    published: event?.published ?? false,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = event ? "PUT" : "POST";
    const url = event ? `/api/admin/events/${event.id}` : "/api/admin/events";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <Input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Registration URL</label>
        <Input type="url" value={form.registerUrl} onChange={(e) => set("registerUrl", e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Flyer URL</label>
        <Input type="url" value={form.flyerUrl} onChange={(e) => set("flyerUrl", e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-6">
        {[
          ["isOnline", "Online Event"],
          ["isRetreat", "Retreat"],
          ["featured", "Featured on Home"],
          ["published", "Published"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => set(key, e.target.checked)}
              className="accent-[#c9a84c]"
            />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : event ? "Update Event" : "Create Event"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/events")}>Cancel</Button>
      </div>
    </form>
  );
}
