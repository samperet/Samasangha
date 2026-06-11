"use client";

import { useMemo } from "react";
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
};

const TYPES: { key: string; label: string; categories: string[] }[] = [
  { key: "all",             label: "All",             categories: [] },
  { key: "talks",           label: "Talks",           categories: ["TALK"] },
  { key: "dharma-gems",     label: "Dharma gems",     categories: ["DHARMA_GEM"] },
  { key: "articles",        label: "Articles",        categories: ["DANCE_ARTICLE"] },
  { key: "interviews",      label: "Interviews",      categories: ["DANCE_INTERVIEW"] },
  { key: "original-dances", label: "Original dances", categories: ["ORIGINAL_DANCE"] },
];

const CATEGORY_LABEL: Record<string, string> = {
  TALK: "Talk",
  DHARMA_GEM: "Dharma gem",
  DANCE_ARTICLE: "Article",
  DANCE_INTERVIEW: "Interview",
  ORIGINAL_DANCE: "Original dance",
};

const CATEGORY_BADGE: Record<string, string> = {
  TALK: "bg-teal-50 text-teal-800 border-teal-200",
  DHARMA_GEM: "bg-amber-50 text-amber-800 border-amber-200",
  DANCE_ARTICLE: "bg-stone-100 text-stone-700 border-stone-200",
  DANCE_INTERVIEW: "bg-rose-50 text-rose-800 border-rose-200",
  ORIGINAL_DANCE: "bg-sky-50 text-sky-800 border-sky-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

export default function TeachingsBrowser({ items }: { items: TeachingItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the single source of truth, so navbar links like
  // /teachings?type=talks work even when already on this page.
  const rawType = searchParams.get("type");
  const type = TYPES.some((x) => x.key === rawType) ? (rawType as string) : "all";
  const year = searchParams.get("year") ?? "all";
  const sort: "newest" | "oldest" =
    searchParams.get("sort") === "oldest" ? "oldest" : "newest";

  function syncUrl(next: { type?: string; year?: string; sort?: string }) {
    const params = new URLSearchParams();
    const t = next.type ?? type;
    const y = next.year ?? year;
    const s = next.sort ?? sort;
    if (t !== "all") params.set("type", t);
    if (y !== "all") params.set("year", y);
    if (s !== "newest") params.set("sort", s);
    const qs = params.toString();
    router.replace(`/teachings${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const years = useMemo(() => {
    const ys = new Set<string>();
    for (const item of items) {
      if (item.publishedAt) ys.add(String(new Date(item.publishedAt).getUTCFullYear()));
    }
    return [...ys].sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const filtered = useMemo(() => {
    const cats = TYPES.find((t) => t.key === type)?.categories ?? [];
    let list = items.filter((item) => {
      if (cats.length && !cats.includes(item.category)) return false;
      if (year !== "all") {
        if (!item.publishedAt) return false;
        if (String(new Date(item.publishedAt).getUTCFullYear()) !== year) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [items, type, year, sort]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {TYPES.map((t) => {
          const active = type === t.key;
          return (
            <button
              key={t.key}
              onClick={() => syncUrl({ type: t.key })}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-[#1a2744] text-white border-[#1a2744]"
                  : "bg-white/60 text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <select
          value={year}
          onChange={(e) => syncUrl({ year: e.target.value })}
          className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white/60 text-stone-600"
          aria-label="Filter by year"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={() => syncUrl({ sort: sort === "newest" ? "oldest" : "newest" })}
          className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white/60 text-stone-600 hover:border-stone-400 transition-colors"
        >
          {sort === "newest" ? "Newest first ↓" : "Oldest first ↑"}
        </button>

        <span className="text-sm text-stone-400 ml-auto">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-stone-400 italic">Nothing here yet — try a different filter.</p>
      ) : (
        <div className="space-y-8">
          {filtered.map((item) => (
            <article key={item.id} className="border-b border-stone-100 pb-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span
                  className={`text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${
                    CATEGORY_BADGE[item.category] ?? "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {CATEGORY_LABEL[item.category] ?? item.category}
                </span>
                {item.publishedAt && (
                  <span className="text-xs text-stone-400 uppercase tracking-widest">
                    {formatDate(item.publishedAt)}
                  </span>
                )}
              </div>
              <Link href={item.href}>
                <h2 className="text-xl font-bold text-stone-800 hover:text-teal-700 transition-colors mb-2 leading-snug">
                  {item.title}
                </h2>
              </Link>
              {item.excerpt && (
                <p className="text-stone-500 text-sm leading-relaxed mb-3">{item.excerpt}</p>
              )}
              <Link
                href={item.href}
                className="text-sm text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
