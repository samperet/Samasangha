import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import TeachingsBrowser, { type TeachingItem } from "./TeachingsBrowser";

export const metadata: Metadata = { title: "Teachings" };
export const revalidate = 60;

// Detail routes per category — talks and dance articles keep their original
// permalinks; everything else renders through the generic /teachings/[slug].
function hrefFor(category: string, slug: string) {
  switch (category) {
    case "TALK":          return `/teachings/talks/${slug}`;
    case "DANCE_ARTICLE": return `/teachings/dances/articles/${slug}`;
    default:              return `/teachings/${slug}`;
  }
}

async function getItems(): Promise<TeachingItem[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, publishedAt: true,
      },
    });
    return posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      href: hrefFor(p.category, p.slug),
    }));
  } catch {
    return [];
  }
}

export default async function TeachingsPage() {
  const items = await getItems();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-2">Teachings</h1>
      <p className="text-stone-500 mb-10">
        Talks, recordings, dharma gems, articles, and dances from Abraham,
        Halima, and the wider Ruhaniat community — all in one place.
      </p>
      <Suspense>
        <TeachingsBrowser items={items} />
      </Suspense>
    </div>
  );
}
