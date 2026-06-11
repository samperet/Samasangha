"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeepeningGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/deepening/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("That isn't it — try again.");
      setPassword("");
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="rounded-xl border border-stone-200 bg-white/60 px-8 py-10">
        <div className="text-3xl mb-4" aria-hidden>☽ ✦ ☾</div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">For mureeds</h2>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          This page holds materials shared within the circle. Enter the
          password from class to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            placeholder="Password"
            className="w-full text-center border border-stone-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c4922b]/40"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#c4922b] text-white font-medium hover:bg-[#a87b20] transition-colors disabled:opacity-50"
          >
            {loading ? "Opening..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
