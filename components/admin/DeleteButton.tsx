"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
  endpoint,
  label,
  name,
}: {
  id: string;
  endpoint: string;
  label: string;
  name?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-gray-600">
          Delete {name ? `"${name}"` : `this ${label}`}?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <span className="text-gray-300">·</span>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-500 hover:underline text-xs"
    >
      Delete
    </button>
  );
}
