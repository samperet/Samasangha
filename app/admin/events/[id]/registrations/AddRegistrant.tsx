"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

const STATUSES = ["CONFIRMED", "PENDING", "WAITLISTED"] as const;

export default function AddRegistrant({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dietary: "", notes: "", status: "CONFIRMED",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/events/${eventId}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ name: "", email: "", phone: "", dietary: "", notes: "", status: "CONFIRMED" });
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#c4922b] text-white hover:bg-[#a87b20] transition-colors"
      >
        <UserPlus size={15} />
        Add registrant
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full bg-white border border-gray-200 rounded-xl p-5 space-y-3"
    >
      <p className="font-medium text-sm text-gray-700">Add a registrant manually</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Name *"
          required
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Email *"
          required
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="Phone"
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        />
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <input
          value={form.dietary}
          onChange={(e) => set("dietary", e.target.value)}
          placeholder="Dietary needs"
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Notes"
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#c4922b] text-white hover:bg-[#a87b20] transition-colors disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add registrant"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); }}
          className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
