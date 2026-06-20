"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteDesign } from "@/lib/design";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Mirror of lib/design's sectionBackground (the site's top-centred radial),
// kept local so this client component doesn't pull the server-only Prisma
// module into the browser bundle.
function bg(type: string, from: string, to: string): string {
  return type === "gradient"
    ? `radial-gradient(120% 130% at 50% -10%, ${from} 0%, ${to} 100%)`
    : from;
}

export default function DesignForm({ initial }: { initial: SiteDesign }) {
  const router = useRouter();
  const [d, setD] = useState<SiteDesign>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<SiteDesign>) => {
    setD((p) => ({ ...p, ...patch }));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Controls */}
      <div className="space-y-6">
        <SectionEditor
          title="Gatherings section (purple)"
          type={d.purpleType}
          from={d.purpleFrom}
          to={d.purpleTo}
          onType={(t) => set({ purpleType: t })}
          onFrom={(c) => set({ purpleFrom: c })}
          onTo={(c) => set({ purpleTo: c })}
        />
        <SectionEditor
          title="Retreats section"
          type={d.greenType}
          from={d.greenFrom}
          to={d.greenTo}
          onType={(t) => set({ greenType: t })}
          onFrom={(c) => set({ greenFrom: c })}
          onTo={(c) => set({ greenTo: c })}
        />
        <SectionEditor
          title="Footer (green)"
          type={d.footerType}
          from={d.footerFrom}
          to={d.footerTo}
          onType={(t) => set({ footerType: t })}
          onFrom={(c) => set({ footerFrom: c })}
          onTo={(c) => set({ footerTo: c })}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg font-medium text-white disabled:opacity-50"
            style={{ background: "#1a2744" }}
          >
            {saving ? "Saving…" : "Save design"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Live preview</p>
        <MiniHome
          purpleBg={bg(d.purpleType, d.purpleFrom, d.purpleTo)}
          greenBg={bg(d.greenType, d.greenFrom, d.greenTo)}
          footerBg={bg(d.footerType, d.footerFrom, d.footerTo)}
        />
      </div>
    </div>
  );
}

/* ── Section editor ────────────────────────────────────────────────── */

function SectionEditor({
  title,
  type,
  from,
  to,
  onType,
  onFrom,
  onTo,
}: {
  title: string;
  type: string;
  from: string;
  to: string;
  onType: (t: string) => void;
  onFrom: (c: string) => void;
  onTo: (c: string) => void;
}) {
  const gradient = type === "gradient";
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-[#1a2744] mb-4">{title}</h2>

      {/* Solid / gradient toggle */}
      <div className="inline-flex rounded-lg border overflow-hidden mb-4">
        {[
          { v: "solid", label: "Solid" },
          { v: "gradient", label: "Gradient" },
        ].map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => onType(v)}
            className="px-4 py-1.5 text-sm font-medium transition-colors"
            style={type === v ? { background: "#1a2744", color: "#fff" } : { background: "#fff", color: "#475569" }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <ColorPicker label={gradient ? "From" : "Colour"} value={from} onChange={onFrom} />
        {gradient && <ColorPicker label="To" value={to} onChange={onTo} />}
      </div>

      {/* result swatch */}
      <div className="mt-4 h-10 rounded-lg border" style={{ background: bg(type, from, to) }} aria-hidden />
    </div>
  );
}

/* ── Visual colour picker (saturation/value box + hue slider) ───────── */

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [text, setText] = useState(value);
  const lastHex = useRef(value);
  const svRef = useRef<HTMLDivElement | null>(null);

  // Re-derive HSV when the colour changes from outside this picker (not from
  // our own drag/typing), so the handle stays put while dragging.
  useEffect(() => {
    if (value.toLowerCase() !== lastHex.current.toLowerCase()) {
      setHsv(hexToHsv(value));
      lastHex.current = value;
      setText(value);
    }
  }, [value]);

  const emit = (next: Hsv) => {
    const hex = hsvToHex(next.h, next.s, next.v);
    lastHex.current = hex;
    setHsv(next);
    setText(hex);
    onChange(hex);
  };

  const pickSV = (clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = clamp01((clientX - r.left) / r.width);
    const v = clamp01(1 - (clientY - r.top) / r.height);
    emit({ h: hsv.h, s, v });
  };

  return (
    <div style={{ width: 180 }}>
      <span className="block text-xs text-gray-500 mb-1.5">{label}</span>

      {/* Saturation / value box */}
      <div
        ref={svRef}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          pickSV(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) pickSV(e.clientX, e.clientY);
        }}
        className="relative rounded-lg border"
        style={{
          height: 140,
          cursor: "crosshair",
          touchAction: "none",
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsv.h}, 100%, 50%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
            background: HEX.test(value) ? value : "#000",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hue slider */}
      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(hsv.h)}
        onChange={(e) => emit({ h: Number(e.target.value), s: hsv.s, v: hsv.v })}
        aria-label={`${label} hue`}
        className="w-full mt-3 appearance-none rounded-full cursor-pointer"
        style={{
          height: 14,
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      />

      {/* Swatch + hex */}
      <div className="flex items-center gap-2 mt-3">
        <span className="h-7 w-7 rounded-md border shrink-0" style={{ background: HEX.test(value) ? value : "#fff" }} />
        <input
          type="text"
          value={text}
          spellCheck={false}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (HEX.test(v)) onChange(v);
          }}
          placeholder="#000000"
          className="w-full px-2 py-1.5 text-sm font-mono rounded border"
        />
      </div>
    </div>
  );
}

/* ── Mini homepage preview ─────────────────────────────────────────── */

function MiniHome({ purpleBg, greenBg, footerBg }: { purpleBg: string; greenBg: string; footerBg: string }) {
  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--surface-border)" }}>
      {/* Masthead */}
      <div className="px-4 py-5 text-center" style={{ background: "radial-gradient(120% 80% at 50% -10%, #f6eedc 0%, #fbf7ec 60%)" }}>
        <div className="mx-auto h-5 w-28 rounded" style={{ background: "var(--gold-300)", opacity: 0.7 }} />
        <div className="mx-auto mt-2 h-2 w-40 rounded" style={{ background: "var(--parch-300)" }} />
      </div>

      {/* About strip */}
      <div className="px-4 py-3" style={{ background: "#fff" }}>
        <div className="mx-auto h-10 rounded-lg" style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }} />
      </div>

      {/* Gatherings (purple) */}
      <div className="px-4 py-5" style={{ background: purpleBg }}>
        <MiniHeading label="Regular gatherings" light />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <MiniCard />
          <MiniCard />
        </div>
      </div>

      {/* Retreats */}
      <div className="px-4 py-5" style={{ background: greenBg }}>
        <MiniHeading label="Retreats" />
        <div className="space-y-2 mt-3">
          <MiniCard short />
          <MiniCard short />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-5" style={{ background: footerBg }}>
        <div className="flex justify-center gap-1.5 mb-3" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: "var(--gold-300)", fontSize: "0.7rem" }}>♥</span>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="h-2 w-12 rounded" style={{ background: "rgba(255,255,255,0.6)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniHeading({ label, light }: { label: string; light?: boolean }) {
  return (
    <p
      className="text-center font-serif uppercase tracking-widest"
      style={{ fontSize: "0.7rem", color: light ? "rgba(255,255,255,0.92)" : "var(--ink-900)" }}
    >
      {label}
    </p>
  );
}

function MiniCard({ short }: { short?: boolean }) {
  return (
    <div
      className="rounded-lg"
      style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)", height: short ? 28 : 64 }}
    />
  );
}

/* ── colour maths ──────────────────────────────────────────────────── */

type Hsv = { h: number; s: number; v: number };
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const f = (x: number) => Math.round(x).toString(16).padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(HEX.test(hex) ? hex : "#000000");
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}
