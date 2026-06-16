"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LokaRowActions({ id, approved }: { id: string; approved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setApproved(value: boolean) {
    setBusy(true);
    await fetch(`/api/admin/loka/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: value }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Permanently delete this recording?")) return;
    setBusy(true);
    await fetch(`/api/admin/loka/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {approved ? (
        <button
          onClick={() => setApproved(false)}
          disabled={busy}
          className="text-xs px-2.5 py-1 rounded-md font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Unapprove
        </button>
      ) : (
        <button
          onClick={() => setApproved(true)}
          disabled={busy}
          className="text-xs px-2.5 py-1 rounded-md font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="text-xs px-2.5 py-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
