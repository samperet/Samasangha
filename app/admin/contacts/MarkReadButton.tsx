"use client";

import { useRouter } from "next/navigation";

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    router.refresh();
  }

  return (
    <button onClick={markRead} className="text-xs text-gray-500 hover:text-[#1a2744] underline">
      Mark read
    </button>
  );
}
