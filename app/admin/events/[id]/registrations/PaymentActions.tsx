"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentActions({
  bookingId,
  paymentStatus,
}: {
  bookingId: string;
  paymentStatus: "PAID" | "UNPAID";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setPaid(paid: boolean) {
    setBusy(true);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: paid ? "PAID" : "UNPAID" }),
    });
    router.refresh();
    setBusy(false);
  }

  if (paymentStatus === "UNPAID") {
    return (
      <button
        onClick={() => setPaid(true)}
        disabled={busy}
        className="text-xs px-2.5 py-1 rounded-md font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
      >
        {busy ? "Saving…" : "Mark check received"}
      </button>
    );
  }
  return (
    <button
      onClick={() => setPaid(false)}
      disabled={busy}
      className="text-xs px-2.5 py-1 rounded-md text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
    >
      {busy ? "Saving…" : "Mark unpaid"}
    </button>
  );
}
