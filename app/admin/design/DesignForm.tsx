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

// Every editable colour, keyed by its field name on SiteDesign.
type ColorKey =
  | "purpleFrom"
  | "purpleTo"
  | "greenFrom"
  | "greenTo"
  | "footerFrom"
  | "footerTo";

const SECTIONS = [
  { title: "Gatherings section (purple)", prefix: "purple" },
  { title: "Retreats section", prefix: "green" },
  { title: "Footer (green)", prefix: "footer" },
] as const;

const KEY_LABELS: Record<ColorKey, string> = {
  purpleFrom: "Gatherings — main colour",
  purpleTo: "Gatherings — gradient end",
  greenFrom: "Retreats — main colour",
  greenTo: "Retreats — gradient end",
  footerFrom: "Footer — main colour",
  footerTo: "Footer — gradient end",
};

export default function DesignForm({ initial }: { initial: SiteDesign }) {
  const router = useRouter();
  const [d, setD] = useState<SiteDesign>(initial);
  const [activeKey, setActiveKey] = useState<ColorKey>("purpleFrom");
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

  const activeValue = (d[activeKey] as string) || "#000000";

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Controls: choose a section + which swatch to edit */}
      <div className="space-y-6">
        {SECTIONS.map(({ title, prefix }) => {
          const typeKey = `${prefix}Type` as keyof SiteDesign;
          const fromKey = `${prefix}From` as ColorKey;
          const toKey = `${prefix}To` as ColorKey;
          return (
            <SectionEditor
              key={prefix}
              title={title}
              type={d[typeKey] as string}
              from={d[fromKey] as string}
              to={d[toKey] as string}
              fromKey={fromKey}
              toKey={toKey}
              activeKey={activeKey}
              onSelect={setActiveKey}
              onType={(t) => {
                set({ [typeKey]: t });
                // If we just hid the "To" swatch while it was selected,
                // fall back to this section's main colour.
                if (t === "solid" && activeKey === toKey) setActiveKey(fromKey);
              }}
            />
          );
        })}

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

      {/* The single, large colour studio + live preview */}
      <div className="lg:sticky lg:top-6 space-y-6">
        <ColorStudio
          label={KEY_LABELS[activeKey]}
          value={activeValue}
          onChange={(c) => set({ [activeKey]: c })}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Live preview</p>
          <MiniHome
            purpleBg={bg(d.purpleType, d.purpleFrom, d.purpleTo)}
            greenBg={bg(d.greenType, d.greenFrom, d.greenTo)}
            footerBg={bg(d.footerType, d.footerFrom, d.footerTo)}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Section editor: solid/gradient toggle + swatch selectors ───────── */

function SectionEditor({
  title,
  type,
  from,
  to,
  fromKey,
  toKey,
  activeKey,
  onSelect,
  onType,
}: {
  title: string;
  type: string;
  from: string;
  to: string;
  fromKey: ColorKey;
  toKey: ColorKey;
  activeKey: ColorKey;
  onSelect: (k: ColorKey) => void;
  onType: (t: string) => void;
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

      {/* Pick which colour the wheel edits */}
      <div className="flex flex-wrap gap-4">
        <SwatchButton
          label={gradient ? "From" : "Colour"}
          color={from}
          active={activeKey === fromKey}
          onClick={() => onSelect(fromKey)}
        />
        {gradient && (
          <SwatchButton label="To" color={to} active={activeKey === toKey} onClick={() => onSelect(toKey)} />
        )}
      </div>

      {/* Result swatch */}
      <div className="mt-4 h-10 rounded-lg border" style={{ background: bg(type, from, to) }} aria-hidden />
    </div>
  );
}

function SwatchButton({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left group" aria-pressed={active}>
      <span className="block text-xs text-gray-500 mb-1.5">{label}</span>
      <span
        className="block h-14 w-20 rounded-lg transition-shadow"
        style={{
          background: HEX.test(color) ? color : "#fff",
          border: active ? "3px solid #1a2744" : "2px solid rgba(0,0,0,0.12)",
          boxShadow: active ? "0 0 0 4px rgba(26,39,68,0.18)" : "none",
        }}
      />
      <span className="block text-[11px] font-mono text-gray-500 mt-1">{color}</span>
    </button>
  );
}

/* ── World-class colour studio (one large picker at a time) ────────── */

// Quick presets drawn from the site palette (purples, greens, golds, neutrals).
const PRESETS = [
  "#6b4a76", "#4d3155", "#2d1b4e", "#0a7d12", "#024c06", "#3a7d44",
  "#b8860b", "#d4af37", "#f6eedc", "#fbf7ec", "#1a2744", "#ffffff",
];

type EyeDropperResult = { sRGBHex: string };
type EyeDropperCtor = new () => { open: () => Promise<EyeDropperResult> };

function ColorStudio({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [text, setText] = useState(value);
  const [ready, setReady] = useState(false); // gates client-only bits (eyedropper)
  const lastHex = useRef(value);
  const svRef = useRef<HTMLDivElement | null>(null);

  // Flip after the first client paint so the server/client markup matches.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Re-derive HSV when the colour changes from outside this picker (e.g. the
  // admin selects a different swatch), but not from our own drag/typing.
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

  const applyHex = (hex: string) => {
    lastHex.current = hex;
    setHsv(hexToHsv(hex));
    setText(hex);
    onChange(hex);
  };

  // Pointer → saturation (x) and brightness/value (y) on the SV plane.
  const pickSV = (clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = clamp01((clientX - r.left) / r.width);
    const v = clamp01(1 - (clientY - r.top) / r.height);
    emit({ h: hsv.h, s, v });
  };

  const rgb = hexToRgb(HEX.test(value) ? value : "#000000");
  const setChannel = (k: "r" | "g" | "b", n: number) => {
    const c = Math.max(0, Math.min(255, Math.round(n) || 0));
    const next = { ...rgb, [k]: c };
    applyHex(rgbToHex(next.r, next.g, next.b));
  };

  const swatch = HEX.test(value) ? value : "#000000";
  const hueColor = `hsl(${hsv.h} 100% 50%)`;
  const canEyedrop = ready && typeof window !== "undefined" && "EyeDropper" in window;
  const eyedrop = async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const { sRGBHex } = await new Ctor().open();
      if (HEX.test(sRGBHex)) applyHex(sRGBHex);
    } catch {
      /* the picker was dismissed */
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6" style={{ borderColor: "var(--surface-border)" }}>
      <style>{`
        .cs-hue::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid rgba(0,0,0,0.18); box-shadow: 0 1px 4px rgba(0,0,0,.3); cursor: pointer; }
        .cs-hue::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid rgba(0,0,0,0.18); box-shadow: 0 1px 4px rgba(0,0,0,.3); cursor: pointer; }
      `}</style>

      {/* Header with a live preview chip */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Editing</p>
          <h2 className="font-semibold text-[#1a2744] text-lg leading-tight truncate">{label}</h2>
        </div>
        <div
          className="h-12 w-12 shrink-0 rounded-xl"
          style={{ background: swatch, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.15)" }}
          aria-hidden
        />
      </div>

      {/* Saturation / brightness plane */}
      <div
        ref={svRef}
        aria-label={`${label} saturation and brightness — use the R, G, B or hex fields for exact values`}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          pickSV(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) pickSV(e.clientX, e.clientY);
        }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: 232,
          cursor: "crosshair",
          touchAction: "none",
          background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), ${hueColor}`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            borderRadius: "50%",
            border: "3px solid #fff",
            boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
            background: swatch,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hue rail */}
      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(hsv.h)}
          onChange={(e) => emit({ h: Number(e.target.value), s: hsv.s, v: hsv.v })}
          aria-label={`${label} hue`}
          className="cs-hue w-full appearance-none rounded-full cursor-pointer"
          style={{
            height: 18,
            background:
              "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
          }}
        />
      </div>

      {/* Eyedropper + hex */}
      <div className="mt-5 flex items-center gap-2">
        {canEyedrop && (
          <button
            type="button"
            onClick={eyedrop}
            title="Pick a colour from anywhere on screen"
            aria-label="Pick a colour from anywhere on screen"
            className="shrink-0 h-11 w-11 rounded-xl border flex items-center justify-center text-[#1a2744] transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m2 22 1-1h3l9-9" />
              <path d="M3 21v-3l9-9" />
              <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
            </svg>
          </button>
        )}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-base">#</span>
          <input
            type="text"
            value={text.replace(/^#/, "")}
            spellCheck={false}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
              setText("#" + raw);
              const hx = "#" + raw;
              if (HEX.test(hx)) applyHex(hx);
            }}
            placeholder="6b4a76"
            aria-label={`${label} hex code`}
            className="w-full pl-7 pr-3 py-2.5 text-base font-mono uppercase tracking-wide rounded-xl border"
            style={{ borderColor: "var(--surface-border)" }}
          />
        </div>
      </div>

      {/* RGB */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["r", "g", "b"] as const).map((k) => (
          <label key={k} className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{k}</span>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[k]}
              onChange={(e) => setChannel(k, Number(e.target.value))}
              aria-label={`${label} ${k.toUpperCase()} channel`}
              className="w-full px-2.5 py-2 text-sm font-mono rounded-lg border"
              style={{ borderColor: "var(--surface-border)" }}
            />
          </label>
        ))}
      </div>

      {/* Palette */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Palette</p>
        <div className="grid grid-cols-6 gap-2">
          {PRESETS.map((c) => {
            const active = value.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => applyHex(c)}
                aria-label={`Use ${c}`}
                aria-pressed={active}
                className="aspect-square rounded-lg transition-transform hover:scale-[1.08]"
                style={{
                  background: c,
                  boxShadow: active
                    ? "0 0 0 2px #fff, 0 0 0 4px #1a2744"
                    : "inset 0 0 0 1px rgba(0,0,0,0.12)",
                }}
              />
            );
          })}
        </div>
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
