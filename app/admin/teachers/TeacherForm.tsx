"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Teacher } from "@prisma/client";

export default function TeacherForm({ teacher }: { teacher?: Teacher }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: teacher?.name ?? "",
    bio: teacher?.bio ?? "",
    photoUrl: teacher?.photoUrl ?? "",
    order: teacher?.order?.toString() ?? "0",
    published: teacher?.published ?? true,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = teacher ? "PUT" : "POST";
    const url = teacher ? `/api/admin/teachers/${teacher.id}` : "/api/admin/teachers";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: parseInt(form.order) }),
    });
    router.push("/admin/teachers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Photo URL</label>
        <Input type="url" value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Bio *</label>
        <RichTextEditor value={form.bio} onChange={(html) => set("bio", html)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Display Order</label>
        <Input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="w-24" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[#c9a84c]" />
        Published
      </label>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : teacher ? "Update" : "Create"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/teachers")}>Cancel</Button>
      </div>
    </form>
  );
}
