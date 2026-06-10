"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  PENDING: [
    { label: "Confirm", next: "CONFIRMED" },
    { label: "Waitlist", next: "WAITLISTED" },
    { label: "Cancel", next: "CANCELLED" },
  ],
  CONFIRMED: [
    { label: "Waitlist", next: "WAITLISTED" },
    { label: "Cancel", next: "CANCELLED" },
  ],
  WAITLISTED: [
    { label: "Confirm", next: "CONFIRMED" },
    { label: "Cancel", next: "CANCELLED" },
  ],
  CANCELLED: [
    { label: "Restore", next: "PENDING" },
  ],
};

export default function RegistrationActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const actions = TRANSITIONS[currentStatus] ?? [];

  async function updateStatus(next: string) {
    setBusy(true);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
    setBusy(false);
  }

  async function deleteReg() {
    if (!confirm("Permanently delete this registration?")) return;
    setBusy(true);
    await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.next}
          onClick={() => updateStatus(a.next)}
          disabled={busy}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors disabled:opacity-50 ${
            a.next === "CANCELLED"
              ? "text-red-600 hover:bg-red-50"
              : a.next === "CONFIRMED"
              ? "text-green-700 hover:bg-green-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {a.label}
        </button>
      ))}
      <button
        onClick={deleteReg}
        disabled={busy}
        className="text-xs px-2.5 py-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
