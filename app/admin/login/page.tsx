"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Incorrect password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f5ef]">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <Image
          src="/assets/sufi-heart-banner.png"
          alt="SamaSangha winged heart"
          width={600}
          height={272}
          priority
          className="w-auto h-14 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-[#1a2744] mb-2 text-center">SamaSangha Admin</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Enter the password to manage the site</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
