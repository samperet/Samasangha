"use client";

import { useState, useRef } from "react";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadMedia() {
    const res = await fetch("/api/upload");
    if (res.ok) setMedia(await res.json());
  }

  useEffect(() => { loadMedia(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    loadMedia();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Media Library</h1>
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*,audio/*" className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((m) => (
            <div key={m.id} className="group relative bg-white border rounded-lg overflow-hidden">
              {m.mimeType.startsWith("image/") ? (
                <img src={m.url} alt={m.filename} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 text-center">
                  🎵 {m.filename}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{m.filename}</p>
                <button
                  onClick={() => copyUrl(m.url)}
                  className="text-xs text-[#1a2744] hover:underline mt-1"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
