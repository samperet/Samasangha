"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return <p className="text-green-700 font-medium">Thank you! You&apos;re subscribed.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "..." : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-red-600 text-sm self-center">Something went wrong.</p>
      )}
    </form>
  );
}
