"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteDesign } from "@/lib/design";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Mirror of lib/design's sectionBackground, kept local so this client component
// doesn't pull the server-only (Prisma) module into the browser bundle.
function bg(type: string, from: string, to: string): string {
  return type === "gradient" ? `linear-gradient(160deg, ${from} 0%, ${to} 100%)` : from;
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
          title="Retreats section (green)"
          type={d.greenType}
          from={d.greenFrom}
          to={d.greenTo}
          onType={(t) => set({ greenType: t })}
          onFrom={(c) => set({ greenFrom: c })}
          onTo={(c) => set({ greenTo: c })}
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
            style={
              type === v
                ? { background: "#1a2744", color: "#fff" }
                : { background: "#fff", color: "#475569" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        <ColorField label={gradient ? "From" : "Colour"} value={from} onChange={onFrom} />
        {gradient && <ColorField label="To" value={to} onChange={onTo} />}
      </div>

      {/* swatch */}
      <div
        className="mt-4 h-10 rounded-lg border"
        style={{ background: bg(type, from, to) }}
        aria-hidden
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) {
  const [text, setText] = useState(value);

  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX.test(value) ? value : "#000000"}
          onChange={(e) => {
            onChange(e.target.value);
            setText(e.target.value);
          }}
          className="h-9 w-12 rounded border cursor-pointer bg-white p-0.5"
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (HEX.test(v)) onChange(v);
          }}
          placeholder="#000000"
          spellCheck={false}
          className="w-24 px-2 py-1.5 text-sm font-mono rounded border"
        />
      </div>
    </label>
  );
}

/* ── Mini homepage preview ─────────────────────────────────────────── */

function MiniHome({ purpleBg, greenBg }: { purpleBg: string; greenBg: string }) {
  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--surface-border)" }}>
      {/* Masthead */}
      <div
        className="px-4 py-5 text-center"
        style={{ background: "radial-gradient(120% 80% at 50% -10%, #f6eedc 0%, #fbf7ec 60%)" }}
      >
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

      {/* Retreats (green) */}
      <div className="px-4 py-5" style={{ background: greenBg }}>
        <MiniHeading label="Retreats" />
        <div className="space-y-2 mt-3">
          <MiniCard short />
          <MiniCard short />
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
      style={{
        background: "var(--parch-50)",
        border: "1px solid var(--surface-border)",
        height: short ? 28 : 64,
      }}
    />
  );
}
