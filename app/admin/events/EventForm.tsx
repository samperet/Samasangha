"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Event } from "@prisma/client";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--surface-border)",
  boxShadow: "var(--shadow-sm)",
};

export default function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [flyerUploading, setFlyerUploading] = useState(false);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const flyerInputRef = useRef<HTMLInputElement>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 10) : "",
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 10) : "",
    location: event?.location ?? "",
    isOnline: event?.isOnline ?? false,
    isRetreat: event?.isRetreat ?? false,
    registerUrl: event?.registerUrl ?? "",
    flyerUrl: event?.flyerUrl ?? "",
    featuredImageUrl: event?.featuredImageUrl ?? "",
    featured: event?.featured ?? false,
    published: event?.published ?? false,
    // Registration is a single choice; we translate it back to
    // registrationEnabled + registerUrl on submit.
    registrationMode: event?.registrationEnabled
      ? "BUILTIN"
      : event?.registerUrl
        ? "EXTERNAL"
        : "NONE",
    capacity: event?.capacity?.toString() ?? "",
    pricingType: event?.pricingType ?? "FREE",
    priceMin: event?.priceMin ? (event.priceMin / 100).toString() : "",
    priceMax: event?.priceMax ? (event.priceMax / 100).toString() : "",
    earlyBirdPriceMin: event?.earlyBirdPriceMin ? (event.earlyBirdPriceMin / 100).toString() : "",
    earlyBirdPriceMax: event?.earlyBirdPriceMax ? (event.earlyBirdPriceMax / 100).toString() : "",
    earlyBirdDeadline: event?.earlyBirdDeadline
      ? new Date(event.earlyBirdDeadline).toISOString().slice(0, 16)
      : "",
    kidsDiscountPercent: event?.kidsDiscountPercent?.toString() ?? "",
    registrationDeadline: event?.registrationDeadline
      ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
      : "",
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "flyerUrl" | "featuredImageUrl",
    setUploading: (v: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      set(field, data.url);
    }
    setUploading(false);
  }
  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    uploadImage(e, "flyerUrl", setFlyerUploading);
  const handleFeaturedUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    uploadImage(e, "featuredImageUrl", setFeaturedUploading);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = event ? "PUT" : "POST";
    const url = event ? `/api/admin/events/${event.id}` : "/api/admin/events";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        registrationEnabled: form.registrationMode === "BUILTIN",
        registerUrl: form.registrationMode === "EXTERNAL" ? form.registerUrl : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        priceMin: form.priceMin ? Math.round(parseFloat(form.priceMin) * 100) : null,
        priceMax: form.priceMax ? Math.round(parseFloat(form.priceMax) * 100) : null,
        earlyBirdPriceMin: form.earlyBirdPriceMin ? Math.round(parseFloat(form.earlyBirdPriceMin) * 100) : null,
        earlyBirdPriceMax: form.earlyBirdPriceMax ? Math.round(parseFloat(form.earlyBirdPriceMax) * 100) : null,
        earlyBirdDeadline: form.earlyBirdDeadline || null,
        kidsDiscountPercent: form.kidsDiscountPercent ? parseInt(form.kidsDiscountPercent) : null,
        registrationDeadline: form.registrationDeadline || null,
      }),
    });
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Event details */}
      <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Description</label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Start date *</label>
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>End date</label>
            <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Location</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Cambridge Friends Meeting House…" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Featured image</label>
          <p className="text-xs text-gray-400 mb-1.5">Shown on the homepage and event listings. A square image works best.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={featuredInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFeaturedUpload}
              />
              <button
                type="button"
                onClick={() => featuredInputRef.current?.click()}
                disabled={featuredUploading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 border disabled:opacity-50"
                style={{ background: "var(--parch-100)", color: "var(--ink-700)", borderColor: "var(--surface-border)" }}
              >
                {featuredUploading ? "Uploading…" : "Upload image"}
              </button>
              <span className="text-xs" style={{ color: "var(--fg3)" }}>or paste a URL below</span>
            </div>
            <Input
              type="text"
              value={form.featuredImageUrl}
              onChange={(e) => set("featuredImageUrl", e.target.value)}
              placeholder="/uploads/… or https://…"
            />
            {form.featuredImageUrl && (
              <div className="relative w-56">
                <img
                  src={form.featuredImageUrl}
                  alt="Featured preview"
                  className="w-56 rounded-lg object-cover"
                  style={{ border: "1px solid var(--surface-border)", maxHeight: 120 }}
                />
                <button
                  type="button"
                  onClick={() => set("featuredImageUrl", "")}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  style={{ background: "var(--crimson-700)", color: "#fff" }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Flyer image</label>
          <p className="text-xs text-gray-400 mb-1.5">The printable flyer, linked from the event page, not shown inline.</p>
          <div className="space-y-2">
            {/* Upload button */}
            <div className="flex items-center gap-2">
              <input
                ref={flyerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFlyerUpload}
              />
              <button
                type="button"
                onClick={() => flyerInputRef.current?.click()}
                disabled={flyerUploading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 border disabled:opacity-50"
                style={{ background: "var(--parch-100)", color: "var(--ink-700)", borderColor: "var(--surface-border)" }}
              >
                {flyerUploading ? "Uploading…" : "Upload image"}
              </button>
              <span className="text-xs" style={{ color: "var(--fg3)" }}>or paste a URL below</span>
            </div>
            {/* Accepts an uploaded path (/uploads/…) or a full URL, so this is
                type=text, type=url would reject relative upload paths. */}
            <Input
              type="text"
              value={form.flyerUrl}
              onChange={(e) => set("flyerUrl", e.target.value)}
              placeholder="/uploads/… or https://…"
            />
            {/* Preview */}
            {form.flyerUrl && (
              <div className="relative w-40">
                <img
                  src={form.flyerUrl}
                  alt="Flyer preview"
                  className="w-40 rounded-lg object-cover"
                  style={{ border: "1px solid var(--surface-border)", maxHeight: 120 }}
                />
                <button
                  type="button"
                  onClick={() => set("flyerUrl", "")}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  style={{ background: "var(--crimson-700)", color: "#fff" }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          {([
            ["isOnline", "Online event"],
            ["isRetreat", "Retreat"],
            ["featured", "Featured on homepage"],
            ["published", "Published"],
          ] as [string, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="accent-[#c4922b]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Registration */}
      <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Registration</label>
          <p className="text-xs text-gray-400 mb-1.5">How people sign up for this event.</p>
          <select
            value={form.registrationMode}
            onChange={(e) => set("registrationMode", e.target.value)}
            className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--surface-border)", background: "#fff", color: "var(--ink-900)" }}
          >
            <option value="NONE">None</option>
            <option value="EXTERNAL">External registration URL</option>
            <option value="BUILTIN">Built-in registration</option>
          </select>
        </div>

        {form.registrationMode === "EXTERNAL" && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>External registration URL</label>
            <p className="text-xs text-gray-400 mb-1.5">The Register button links here (opens in a new tab).</p>
            <Input type="url" value={form.registerUrl} onChange={(e) => set("registerUrl", e.target.value)} placeholder="https://…" />
          </div>
        )}

        {form.registrationMode === "BUILTIN" && (
          <div className="rounded-lg p-5 space-y-5" style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}>
            <p className="text-xs text-gray-500 leading-relaxed">
              A registration form appears on the public event page. Submissions are stored here in the admin and you receive an email notification for each one.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Capacity</label>
              <p className="text-xs text-gray-400 mb-1.5">Max registrations before switching to waitlist. Leave blank for unlimited.</p>
              <Input type="number" min="1" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 30" className="max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Pricing</label>
              <div className="flex gap-2 mb-3">
                {([
                  ["FREE", "Free"],
                  ["FIXED", "Fixed price"],
                  ["SLIDING", "Sliding scale"],
                ] as [string, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("pricingType", value)}
                    className="px-3.5 py-1.5 text-sm rounded-full border transition-colors"
                    style={
                      form.pricingType === value
                        ? { background: "var(--gold-100)", borderColor: "var(--gold-500)", color: "var(--gold-700)", fontWeight: 600 }
                        : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg2)" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {form.pricingType === "FIXED" && (
                <div className="max-w-xs">
                  <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
                  <Input type="number" min="0" step="0.01" value={form.priceMin} onChange={(e) => set("priceMin", e.target.value)} placeholder="120" />
                </div>
              )}

              {form.pricingType === "SLIDING" && (
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
                    <Input type="number" min="0" step="0.01" value={form.priceMin} onChange={(e) => set("priceMin", e.target.value)} placeholder="250" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
                    <Input type="number" min="0" step="0.01" value={form.priceMax} onChange={(e) => set("priceMax", e.target.value)} placeholder="450" />
                  </div>
                </div>
              )}
            </div>

            {form.pricingType !== "FREE" && (
              <div className="rounded-lg p-4" style={{ background: "#fff", border: "1px solid var(--surface-border)" }}>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Early bird (optional)</label>
                <p className="text-xs text-gray-400 mb-3">
                  Discounted {form.pricingType === "SLIDING" ? "range" : "price"} shown until the early-bird deadline, then the regular price applies.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {form.pricingType === "SLIDING" ? "Early bird min ($)" : "Early bird price ($)"}
                    </label>
                    <Input type="number" min="0" step="0.01" value={form.earlyBirdPriceMin} onChange={(e) => set("earlyBirdPriceMin", e.target.value)} placeholder="," />
                  </div>
                  {form.pricingType === "SLIDING" && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Early bird max ($)</label>
                      <Input type="number" min="0" step="0.01" value={form.earlyBirdPriceMax} onChange={(e) => set("earlyBirdPriceMax", e.target.value)} placeholder="," />
                    </div>
                  )}
                  <div className={form.pricingType === "SLIDING" ? "col-span-2" : ""}>
                    <label className="text-xs text-gray-500 mb-1 block">Early bird ends</label>
                    <Input type="datetime-local" value={form.earlyBirdDeadline} onChange={(e) => set("earlyBirdDeadline", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            {form.pricingType !== "FREE" && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Kids discount (18 &amp; under)</label>
                <p className="text-xs text-gray-400 mb-1.5">Percent off the price for children 18 and under. Leave blank for none.</p>
                <div className="flex items-center gap-2 max-w-[8rem]">
                  <Input type="number" min="0" max="100" value={form.kidsDiscountPercent} onChange={(e) => set("kidsDiscountPercent", e.target.value)} placeholder="e.g. 50" />
                  <span className="text-sm" style={{ color: "var(--fg2)" }}>%</span>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-700)" }}>Registration deadline</label>
              <p className="text-xs text-gray-400 mb-1.5">Registration closes automatically at this time. Leave blank to keep open.</p>
              <Input type="datetime-local" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : event ? "Update event" : "Create event"}
        </Button>
        {event && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/admin/events/${event.id}/registrations`)}
          >
            View registrations →
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/events")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
