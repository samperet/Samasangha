"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Post } from "@prisma/client";

const CATEGORIES = [
  { value: "DHARMA_GEM", label: "Dharma Gem" },
  { value: "TALK", label: "Talk" },
  { value: "DANCE_ARTICLE", label: "Dance Article" },
  { value: "DANCE_INTERVIEW", label: "Dance Interview" },
  { value: "ORIGINAL_DANCE", label: "Original Dance" },
  { value: "RESOURCE", label: "Resource" },
];

export default function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    category: post?.category ?? "DHARMA_GEM",
    published: post?.published ?? false,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = post ? "PUT" : "POST";
    const url = post ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt / Summary</label>
          <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
            className="accent-[#c9a84c]"
          />
          Published
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : post ? "Update Post" : "Create Post"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/posts")}>Cancel</Button>
      </div>
    </form>
  );
}
