"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Album, Track } from "@prisma/client";

type AlbumWithTracks = Album & { tracks: Track[] };

export default function AlbumForm({ album }: { album?: AlbumWithTracks }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: album?.title ?? "",
    description: album?.description ?? "",
    coverUrl: album?.coverUrl ?? "",
    year: album?.year?.toString() ?? "",
    buyUrl: album?.buyUrl ?? "",
    published: album?.published ?? false,
  });
  const [tracks, setTracks] = useState<{ title: string; duration: string; audioUrl: string }[]>(
    album?.tracks.map((t) => ({
      title: t.title,
      duration: t.duration?.toString() ?? "",
      audioUrl: t.audioUrl ?? "",
    })) ?? []
  );

  function setField(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTrack() {
    setTracks((t) => [...t, { title: "", duration: "", audioUrl: "" }]);
  }

  function updateTrack(i: number, key: string, value: string) {
    setTracks((t) => t.map((track, idx) => idx === i ? { ...track, [key]: value } : track));
  }

  function removeTrack(i: number) {
    setTracks((t) => t.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = album ? "PUT" : "POST";
    const url = album ? `/api/admin/albums/${album.id}` : "/api/admin/albums";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: form.year ? parseInt(form.year) : null,
        tracks: tracks.map((t, i) => ({
          title: t.title,
          order: i + 1,
          duration: t.duration ? parseInt(t.duration) : null,
          audioUrl: t.audioUrl || null,
        })),
      }),
    });
    router.push("/admin/albums");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input value={form.title} onChange={(e) => setField("title", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Input type="number" value={form.year} onChange={(e) => setField("year", e.target.value)} min="1900" max="2099" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            {/* type=text: covers are often relative paths (/assets/…, /music/covers/…) */}
            <Input type="text" value={form.coverUrl} onChange={(e) => setField("coverUrl", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Buy / Stream URL</label>
          <Input type="url" value={form.buyUrl} onChange={(e) => setField("buyUrl", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => setField("published", e.target.checked)} className="accent-[#c9a84c]" />
          Published
        </label>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-[#1a2744]">Tracks</h2>
          <Button type="button" variant="ghost" size="sm" onClick={addTrack}>+ Add Track</Button>
        </div>
        <div className="space-y-3">
          {tracks.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <span className="text-gray-400 text-sm col-span-1">{i + 1}.</span>
              <div className="col-span-5">
                <Input placeholder="Track title" value={t.title} onChange={(e) => updateTrack(i, "title", e.target.value)} />
              </div>
              <div className="col-span-2">
                <Input placeholder="Sec" type="number" value={t.duration} onChange={(e) => updateTrack(i, "duration", e.target.value)} />
              </div>
              <div className="col-span-3">
                <Input placeholder="Audio URL" value={t.audioUrl} onChange={(e) => updateTrack(i, "audioUrl", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeTrack(i)} className="col-span-1 text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          ))}
          {tracks.length === 0 && <p className="text-gray-400 text-sm italic">No tracks yet. Click &ldquo;Add Track&rdquo; above.</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : album ? "Update Album" : "Create Album"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/albums")}>Cancel</Button>
      </div>
    </form>
  );
}
