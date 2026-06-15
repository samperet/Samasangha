import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { youtubeThumbnail } from "@/components/public/YouTubeEmbed";
import TeachingsBrowser, { type TeachingItem } from "./TeachingsBrowser";

export const metadata: Metadata = { title: "Teachings" };
export const revalidate = 60;

// Detail routes per category, talks and dance articles keep their original
// permalinks; everything else renders through the generic /teachings/[slug].
function hrefFor(category: string, slug: string) {
  switch (category) {
    case "TALK":          return `/teachings/talks/${slug}`;
    case "DANCE_ARTICLE": return `/teachings/dances/articles/${slug}`;
    default:              return `/teachings/${slug}`;
  }
}

// Hero images for items whose artwork isn't in the post content
// (mirrors ARTICLE_META in the dance-article detail page).
const KNOWN_IMAGES: Record<string, string> = {
  "dancing-the-heart-awake": "/assets/dancing-with-murshid-sam.jpeg",
};

// First inline image in the post body, if any
function firstContentImage(html: string): string | null {
  const m = html.match(/<img[^>]*src="([^"]+)"/i);
  return m?.[1] ?? null;
}

async function getItems(): Promise<TeachingItem[]> {
  try {
    const [posts, videos] = await Promise.all([
      prisma.post.findMany({
        // Original dances live under Music now, not Teachings
        where: { published: true, category: { not: "ORIGINAL_DANCE" } },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          category: true, publishedAt: true, youtubeUrl: true, content: true,
        },
      }),
      prisma.musicVideo.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, slug: true, description: true,
          youtubeUrl: true, createdAt: true,
        },
      }),
    ]);

    const postItems: TeachingItem[] = posts.map((p) => {
      const videoThumb = youtubeThumbnail(p.youtubeUrl);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        category: p.category,
        publishedAt: p.publishedAt?.toISOString() ?? null,
        href: hrefFor(p.category, p.slug),
        image: videoThumb ?? KNOWN_IMAGES[p.slug] ?? firstContentImage(p.content),
        hasVideo: Boolean(videoThumb),
      };
    });

    // YouTube videos appear as teachings and open on YouTube
    const videoItems: TeachingItem[] = videos
      .filter((v) => v.youtubeUrl)
      .map((v) => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        excerpt: v.description,
        category: "VIDEO",
        publishedAt: v.createdAt.toISOString(),
        href: v.youtubeUrl!,
        external: true,
        image: youtubeThumbnail(v.youtubeUrl),
        hasVideo: true,
      }));

    return [...postItems, ...videoItems];
  } catch {
    return [];
  }
}

export default async function TeachingsPage() {
  const items = await getItems();

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="text-center mb-4">
        <h1
          className="font-serif"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.1 }}
        >
          Teachings
        </h1>
        <div className="flex justify-center my-4" aria-hidden>
          <img src="/assets/decorative-line.png" alt="" className="h-6 w-auto" />
        </div>
        <p className="leading-relaxed max-w-xl mx-auto" style={{ color: "var(--fg2)" }}>
          Deepen your practice with our library of recorded material.
        </p>
      </div>

      <div className="mb-10" />

      <Suspense>
        <TeachingsBrowser items={items} />
      </Suspense>
    </div>
  );
}
