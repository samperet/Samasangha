"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
  endpoint,
  label,
}: {
  id: string;
  endpoint: string;
  label: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:underline text-xs"
    >
      Delete
    </button>
  );
}
