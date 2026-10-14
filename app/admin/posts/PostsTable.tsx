"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import { youtubeId } from "@/components/public/YouTubeEmbed";

export const CATEGORY_LABELS: Record<string, string> = {
  DHARMA_GEM: "Dharma Gem",
  TALK: "Talk",
  DANCE_ARTICLE: "Dance Article",
  DANCE_INTERVIEW: "Dance Interview",
  ORIGINAL_DANCE: "Original Dance",
  RESOURCE: "Resource",
};

export type PostRow = {
  id: string;
  title: string;
  category: string;
  youtubeUrl: string | null;
  published: boolean;
  createdAt: string;
  publishedAt: string | null;
};

type SortKey = "title" | "category" | "published" | "date";
type RowState = "idle" | "saving" | "saved" | "error";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "published", label: "Status" },
  { key: "date", label: "Date" },
];

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PostsTable({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(posts);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [state, setState] = useState<Record<string, RowState>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  const sorted = useMemo(() => {
    const value = (p: PostRow) => {
      switch (sort.key) {
        case "title": return p.title.toLowerCase();
        case "category": return (CATEGORY_LABELS[p.category] ?? p.category).toLowerCase();
        case "published": return p.published ? 1 : 0;
        case "date": return new Date(p.createdAt).getTime();
      }
    };
    return [...rows].sort((a, b) => {
      const x = value(a), y = value(b);
      if (x < y) return -sort.dir;
      if (x > y) return sort.dir;
      return 0;
    });
  }, [rows, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: (s.dir * -1) as 1 | -1 }
        // Dates and status read best newest/published first; text A–Z.
        : { key, dir: key === "date" || key === "published" ? -1 : 1 }
    );
  }

  async function patch(id: string, body: Record<string, unknown>, revert: () => void) {
    setState((s) => ({ ...s, [id]: "saving" }));
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save");
      }
      setState((s) => ({ ...s, [id]: "saved" }));
      setTimeout(() => setState((s) => ({ ...s, [id]: "idle" })), 1600);
      router.refresh();
    } catch (err) {
      revert();
      setState((s) => ({ ...s, [id]: "error" }));
      setMessage((m) => ({ ...m, [id]: err instanceof Error ? err.message : "Could not save" }));
    }
  }

  function setCategory(p: PostRow, category: string) {
    const previous = p.category;
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, category } : x)));
    patch(p.id, { category }, () =>
      setRows((r) => r.map((x) => (x.id === p.id ? { ...x, category: previous } : x)))
    );
  }

  function setPublished(p: PostRow, published: boolean) {
    const previous = p.published;
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, published } : x)));
    patch(p.id, { published }, () =>
      setRows((r) => r.map((x) => (x.id === p.id ? { ...x, published: previous } : x)))
    );
  }

  function saveVideo(p: PostRow, raw: string) {
    const value = raw.trim();
    const current = p.youtubeUrl ?? "";
    if (value === current) return;
    // A link we can't read an id from would render as a missing embed, so it's
    // caught here rather than discovered on the public page.
    if (value !== "" && !youtubeId(value)) {
      setState((s) => ({ ...s, [p.id]: "error" }));
      setMessage((m) => ({ ...m, [p.id]: "That doesn't look like a YouTube link." }));
      return;
    }
    const previous = p.youtubeUrl;
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, youtubeUrl: value || null } : x)));
    patch(p.id, { youtubeUrl: value }, () =>
      setRows((r) => r.map((x) => (x.id === p.id ? { ...x, youtubeUrl: previous } : x)))
    );
  }

  if (rows.length === 0) return <p className="text-gray-400">No posts yet.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left font-medium text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1 hover:text-[#1a2744]"
                    aria-label={`Sort by ${label}`}
                  >
                    {label}
                    <span aria-hidden className={sort.key === key ? "text-[#1a2744]" : "text-gray-300"}>
                      {sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-500">Video link</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((p) => {
              const rowState = state[p.id] ?? "idle";
              return (
                <tr key={p.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-[#1a2744]">
                    {p.title}
                    {rowState === "error" && (
                      <span className="block text-xs font-normal text-red-600 mt-1">{message[p.id]}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={p.category}
                      onChange={(e) => setCategory(p, e.target.value)}
                      disabled={rowState === "saving"}
                      className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] disabled:opacity-60"
                      aria-label={`Category for ${p.title}`}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPublished(p, !p.published)}
                      disabled={rowState === "saving"}
                      className={`px-2 py-0.5 rounded-full text-xs transition-colors disabled:opacity-60 ${
                        p.published
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title={p.published ? "Click to unpublish" : "Click to publish"}
                    >
                      {p.published ? "Published" : "Draft"}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{shortDate(p.createdAt)}</td>

                  <td className="px-4 py-3">
                    <input
                      type="url"
                      inputMode="url"
                      defaultValue={p.youtubeUrl ?? ""}
                      onBlur={(e) => saveVideo(p, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                          e.currentTarget.value = p.youtubeUrl ?? "";
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="YouTube link"
                      disabled={rowState === "saving"}
                      className="w-56 border border-gray-300 rounded px-2 py-1 text-xs focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] disabled:opacity-60"
                      aria-label={`YouTube link for ${p.title}`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/posts/${p.id}`} className="text-[#1a2744] hover:underline text-xs">Edit</Link>
                      <DeleteButton id={p.id} endpoint="/api/admin/posts" label="post" name={p.title} />
                      <span className="text-xs w-12" aria-live="polite">
                        {rowState === "saving" && <span className="text-gray-400">Saving…</span>}
                        {rowState === "saved" && <span className="text-green-600">Saved ✓</span>}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
