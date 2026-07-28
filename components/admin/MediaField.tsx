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

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed. Please try again.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed. Please check your connection and try again.");
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
