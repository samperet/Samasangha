"use client";

import { useRef, useState } from "react";
import Input from "@/components/ui/Input";

export const isPdfUrl = (url: string) => /\.pdf(\?|#|$)/i.test(url.trim());

/**
 * Upload field for an image (and optionally a PDF), offering three ways in:
 * choose a file, drag one onto the drop zone, or paste from the clipboard.
 *
 * Clipboard paste is scoped to the drop zone (it's focusable and handles its
 * own paste event), so with several of these on a page there's never any doubt
 * about which field a paste lands in.
 */
export default function MediaField({
  value,
  onChange,
  allowPdf = false,
  previewWidth = 224,
}: {
  value: string;
  onChange: (url: string) => void;
  allowPdf?: boolean;
  previewWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const accept = allowPdf ? "image/*,application/pdf" : "image/*";
  const noun = allowPdf ? "image or PDF" : "image";

  // Post the file through our own API. Serverless platforms cap a function's
  // request body (4.5 MB on Vercel), so this is the small-file / local-dev path.
  async function uploadViaApi(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (res.status === 413) {
        throw new Error(
          `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB, over the 4.5 MB the server accepts directly. Please use a smaller file.`
        );
      }
      throw new Error(
        (body && typeof body.error === "string" && body.error) ||
          `Upload failed (${res.status}). Please try again.`
      );
    }
    return (await res.json()).url as string;
  }

  // Ask for a presigned URL and send the file straight to storage, so its size
  // is never limited by the serverless function. Returns null when the server
  // has no direct-upload storage configured.
  async function uploadDirect(file: File): Promise<string | null> {
    const sign = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    if (sign.status === 501) return null; // not configured — caller falls back
    const info = await sign.json().catch(() => ({}));
    if (!sign.ok) throw new Error(info.error || "Upload failed. Please try again.");

    const put = await fetch(info.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error(`Storage rejected the file (${put.status}).`);

    // Record it in the media library (a small JSON post, no size concerns).
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: info.publicUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });
    return info.publicUrl as string;
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      let url: string | null = null;
      try {
        url = await uploadDirect(file);
      } catch (e) {
        // Direct upload exists but failed (e.g. the bucket's CORS rules): fall
        // back for files the function can still accept, otherwise report it.
        if (file.size > 4.4 * 1024 * 1024) throw e;
        url = null;
      }
      if (url === null) url = await uploadViaApi(file);
      if (url) onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // Pull the first usable file out of a drop or paste.
  function takeFiles(files: FileList | null | undefined) {
    const file = Array.from(files ?? []).find(
      (f) => f.type.startsWith("image/") || (allowPdf && f.type === "application/pdf")
    );
    if (!file) {
      setError(`That doesn't look like an ${noun}.`);
      return;
    }
    void upload(file);
  }

  const pdf = isPdfUrl(value);

  return (
    <div className="space-y-2">
      {/* Drop / paste zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload an ${noun}: click to choose a file, or drop or paste one here`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPaste={(e) => {
          const files = e.clipboardData?.files;
          if (files && files.length) {
            e.preventDefault();
            takeFiles(files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFiles(e.dataTransfer?.files);
        }}
        className="w-full rounded-xl px-4 py-5 text-center cursor-pointer transition-colors"
        style={{
          border: `2px dashed ${dragging || focused ? "var(--gold-500)" : "var(--surface-border)"}`,
          background: dragging ? "var(--gold-100)" : "var(--parch-100)",
          outline: "none",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            takeFiles(e.target.files);
            e.target.value = ""; // let the same file be re-picked
          }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--ink-700)" }}>
          {uploading ? "Uploading…" : `Click to choose an ${noun}`}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--fg3)" }}>
          {focused
            ? "Now press ⌘V / Ctrl+V to paste"
            : `or drag one here — or click here and paste (⌘V) from your clipboard`}
        </p>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--crimson-700)" }}>
          {error}
        </p>
      )}

      {/* The stored path: an uploaded /uploads/… path or a full URL, so this is
          type=text (type=url would reject relative paths). */}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/… or https://…"
      />

      {value && (
        <div className="relative inline-block" style={{ width: pdf ? "auto" : previewWidth }}>
          {pdf ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{
                border: "1px solid var(--surface-border)",
                background: "#fff",
                color: "var(--ink-700)",
              }}
            >
              <span aria-hidden>📄</span>
              PDF attached — open
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Preview"
              className="rounded-lg object-cover"
              style={{ width: previewWidth, border: "1px solid var(--surface-border)", maxHeight: 120 }}
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
            style={{ background: "var(--crimson-700)", color: "#fff" }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
