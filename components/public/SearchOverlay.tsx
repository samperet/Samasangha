"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface Result {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  group: string;
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 220);
  }

  const grouped: Record<string, Result[]> = {};
  for (const r of results) {
    if (!grouped[r.group]) grouped[r.group] = [];
    grouped[r.group].push(r);
  }

  return (
    /* Backdrop — warm translucent parchment fog */
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center pt-[15vh] px-4"
      style={{ background: "rgba(251,247,236,.82)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: "var(--parch-50)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--surface-border)" }}
        >
          <Search size={18} style={{ color: "var(--gold-600)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search teachings, events, music…"
            className="flex-1 bg-transparent outline-none text-base"
            style={{
              color: "var(--ink-900)",
              fontFamily: "var(--font-sans)",
              caretColor: "var(--gold-600)",
            }}
          />
          <button
            onClick={onClose}
            style={{ color: "var(--ink-700)", opacity: 0.45 }}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[56vh] overflow-y-auto">
          {loading && (
            <p className="px-5 py-4 text-sm" style={{ color: "var(--fg2)" }}>
              Searching…
            </p>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--fg2)" }}>
              Nothing found for &ldquo;{query}&rdquo;
            </p>
          )}

          {!loading && Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p
                className="eyebrow px-5 pt-5 pb-2"
                style={{ fontSize: "0.68rem", color: "var(--gold-700)" }}
              >
                {group}
              </p>
              {items.map((r) => (
                <Link
                  key={r.id}
                  href={r.href}
                  onClick={onClose}
                  className="flex items-baseline justify-between px-5 py-3 transition-colors duration-150"
                  style={{ color: "var(--ink-900)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--parch-200)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="font-serif"
                    style={{ fontSize: "1.05rem", fontWeight: 400, color: "var(--ink-800)" }}
                  >
                    {r.label}
                  </span>
                  <span className="text-xs ml-4 shrink-0" style={{ color: "var(--ink-600)" }}>
                    {r.sublabel}
                  </span>
                </Link>
              ))}
            </div>
          ))}

          {!query && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--fg3)" }}>
                Start typing to search across teachings, events, and music.
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-5 py-3 flex items-center gap-4 text-xs"
          style={{ borderTop: "1px solid var(--surface-border)", color: "var(--ink-600)", opacity: 0.5 }}
        >
          <span><kbd style={{ fontFamily: "var(--font-sans)" }}>esc</kbd> to close</span>
          <span><kbd style={{ fontFamily: "var(--font-sans)" }}>↵</kbd> to visit</span>
        </div>
      </div>
    </div>
  );
}
