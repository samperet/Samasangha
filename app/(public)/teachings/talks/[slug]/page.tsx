import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, category: "TALK" },
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
  return { title: post?.title ?? "Talk" };
}

export default async function TalkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, category: "TALK", published: true },
  }).catch(() => null);

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/teachings/talks"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8 inline-block"
      >
        ← Talks
      </Link>
      <article>
        {post.publishedAt && (
          <p className="text-sm text-stone-400 mb-3">{formatDate(post.publishedAt)}</p>
        )}
        <h1 className="text-3xl font-bold text-stone-800 mb-8 leading-snug">{post.title}</h1>
        <div
          className="prose prose-stone max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
