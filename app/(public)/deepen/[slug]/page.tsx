import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import YouTubeEmbed from "@/components/public/YouTubeEmbed";

export const revalidate = 300;

// Generic post page for categories without a dedicated route
// (dharma gems, interviews, original dances). Static siblings like
// /deepen/talks always win over this dynamic segment.

const CATEGORY_LABEL: Record<string, string> = {
  TALK: "Talk",
  DHARMA_GEM: "Dharma gem",
  DANCE_ARTICLE: "Article",
  DANCE_INTERVIEW: "Interview",
  ORIGINAL_DANCE: "Original dance",
};

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        category: { in: ["DHARMA_GEM", "DANCE_INTERVIEW"] },
      },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } }).catch(() => null);
  return { title: post?.title ?? "Teaching" };
}

export default async function TeachingPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  }).catch(() => null);

  if (!post) notFound();

  // Send categories with dedicated routes to their canonical permalink
  if (post.category === "TALK") redirect(`/deepen/talks/${post.slug}`);
  if (post.category === "DANCE_ARTICLE") redirect(`/deepen/dances/articles/${post.slug}`);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/deepen"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8 inline-block"
      >
        ← Teachings
      </Link>
      <article>
        <p className="text-sm text-stone-400 mb-3">
          {CATEGORY_LABEL[post.category] ?? post.category}
          {post.publishedAt && <> · {formatDate(post.publishedAt)}</>}
        </p>
        <h1 className="text-3xl font-bold text-stone-800 mb-8 leading-snug">{post.title}</h1>
        <YouTubeEmbed url={post.youtubeUrl} title={post.title} />
        <div
          className="prose prose-stone max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
