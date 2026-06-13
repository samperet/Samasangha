"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export type TeachingItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  publishedAt: string | null; // ISO
  href: string;
  external?: boolean; // opens in a new tab (e.g. YouTube videos)
  image?: string | null; // thumbnail, video still or article image
  hasVideo?: boolean; // shows a play indicator on the thumbnail
};

const TYPES: { key: string; label: string; categories: string[] }[] = [
  { key: "all",             label: "All",             categories: [] },
  { key: "talks",           label: "Talks",           categories: ["TALK"] },
  { key: "dharma-gems",     label: "Dharma gems",     categories: ["DHARMA_GEM"] },
  { key: "videos",          label: "Videos",          categories: ["VIDEO"] },
  { key: "articles",        label: "Articles",        categories: ["DANCE_ARTICLE"] },
  { key: "interviews",      label: "Interviews",      categories: ["DANCE_INTERVIEW"] },
];

const CATEGORY_LABEL: Record<string, string> = {
  TALK: "Talk",
  DHARMA_GEM: "Dharma gem",
  VIDEO: "Video",
  DANCE_ARTICLE: "Article",
  DANCE_INTERVIEW: "Interview",
  ORIGINAL_DANCE: "Original dance",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

// Small gold play triangle shown over video thumbnails
function PlayBadge() {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <span
        className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
        style={{
          width: 44,
          height: 44,
          background: "rgba(26, 18, 8, 0.62)",
          border: "1.5px solid rgba(217, 164, 54, 0.85)",
          backdropFilter: "blur(2px)",
        }}
      >
        <svg width="15" height="16" viewBox="0 0 15 16" fill="none">
          <path d="M2 1.5v13l11-6.5L2 1.5z" fill="var(--gold-300)" />
        </svg>
      </span>
    </span>
  );
}

// Centered rose-and-vine divider between entries
function RoseDivider() {
  return (
    <div className="flex justify-center py-7" aria-hidden>
      <img src="/assets/decorative-line.png" alt="" className="h-4 w-auto opacity-50" />
    </div>
  );
}

export default function TeachingsBrowser({ items }: { items: TeachingItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the single source of truth, so navbar links like
  // /deepen?type=talks work even when already on this page.
  const rawType = searchParams.get("type");
  const type = TYPES.some((x) => x.key === rawType) ? (rawType as string) : "all";

  // Text search filters instantly as you type (kept in local state, not the URL).
  // The field is collapsed behind a magnifier to the right of the filter tabs.
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function syncUrl(next: { type?: string }) {
    const params = new URLSearchParams();
    const t = next.type ?? type;
    if (t !== "all") params.set("type", t);
    const qs = params.toString();
    router.replace(`/deepen${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const cats = TYPES.find((t) => t.key === type)?.categories ?? [];
    const q = query.trim().toLowerCase();
    let list = items.filter((item) => {
      if (cats.length && !cats.includes(item.category)) return false;
      if (q) {
        const haystack = `${item.title} ${item.excerpt ?? ""} ${CATEGORY_LABEL[item.category] ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    // Newest first
    list = [...list].sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    });
    return list;
  }, [items, type, query]);

  return (
    <>
      {/* Type filter, quiet small-caps with a gold underline on the active one.
          A magnifier sits at the right end and slides open into a search field. */}
      <nav
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6"
        aria-label="Filter by type"
      >
        {TYPES.map((t) => {
          const active = type === t.key;
          return (
            <button
              key={t.key}
              onClick={() => syncUrl({ type: t.key })}
              className="eyebrow pb-1 transition-colors duration-150"
              style={{
                fontSize: "0.72rem",
                color: active ? "var(--gold-700)" : "var(--fg3)",
                borderBottom: active
                  ? "2px solid var(--gold-500)"
                  : "2px solid transparent",
                background: "none",
              }}
            >
              {t.label}
            </button>
          );
        })}

        {/* Search, collapsed to an icon, expands inline on click */}
        <div className="flex items-center gap-2 pb-1">
          <button
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={searchOpen ? "Close search" : "Search teachings"}
            aria-expanded={searchOpen}
            className="transition-colors duration-150"
            style={{ color: searchOpen ? "var(--gold-700)" : "var(--fg3)", background: "none", lineHeight: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => { if (!searchInputRef.current?.value) setSearchOpen(false); }}
            placeholder="Search teachings…"
            aria-label="Search teachings"
            aria-hidden={!searchOpen}
            tabIndex={searchOpen ? 0 : -1}
            className="text-sm outline-none transition-all duration-200"
            style={{
              width: searchOpen ? "11rem" : 0,
              opacity: searchOpen ? 1 : 0,
              padding: searchOpen ? "0.3rem 0" : 0,
              borderBottom: searchOpen ? "1px solid var(--surface-border)" : "1px solid transparent",
              background: "none",
              color: "var(--ink-900)",
              pointerEvents: searchOpen ? "auto" : "none",
            }}
          />
        </div>
      </nav>

      <div className="mb-12" />

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center italic" style={{ color: "var(--fg3)" }}>
          {query.trim()
            ? `No teachings match “${query.trim()}”.`
            : "Nothing here yet, try a different filter."}
        </p>
      ) : (
        <div>
          {filtered.map((item, i) => {
            const linkProps = item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            const LinkEl = item.external ? "a" : Link;
            return (
              <div key={item.id}>
                {i > 0 && <RoseDivider />}
                <article className="group">
                  <LinkEl
                    href={item.href}
                    {...linkProps}
                    className="flex flex-col sm:flex-row gap-6 sm:items-start"
                    style={{ textDecoration: "none" }}
                  >
                    {/* Media, video still or article image */}
                    {item.image && (
                      <div
                        className="relative shrink-0 w-full sm:w-56 overflow-hidden rounded-xl"
                        style={{ boxShadow: "var(--shadow-md)" }}
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        {item.hasVideo && <PlayBadge />}
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="eyebrow mb-2" style={{ fontSize: "0.68rem", color: "var(--gold-700)" }}>
                        {CATEGORY_LABEL[item.category] ?? item.category}
                        {item.publishedAt && (
                          <span style={{ color: "var(--fg3)" }}>
                            {"  ·  "}
                            {formatDate(item.publishedAt)}
                          </span>
                        )}
                      </p>
                      <h2
                        className="font-serif leading-snug mb-2 transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                        style={{ fontSize: "1.45rem", fontWeight: 500, color: "var(--ink-900)" }}
                      >
                        {item.title}
                      </h2>
                      {item.excerpt && (
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--fg2)" }}>
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </LinkEl>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
