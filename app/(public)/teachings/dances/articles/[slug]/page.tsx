import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 300;

// Map article slugs to rich metadata
const ARTICLE_META: Record<string, {
  heroImage?: string;
  heroAlt?: string;
  authorSlug?: string;
  series?: string;
}> = {
  "dancing-the-heart-awake": {
    heroImage: "/assets/dancing-with-murshid-sam.jpeg",
    heroAlt: "Dancing with Murshid Sam",
    authorSlug: "abraham-sussman",
    series: "Elements of Mastery",
  },
  "be-ye-songs-of-glory": {
    authorSlug: "halima-sussman",
    series: "Elements of Mastery",
  },
};

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, category: "DANCE_ARTICLE" },
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
  return { title: post?.title ?? "Article" };
}

export default async function DanceArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, category: "DANCE_ARTICLE", published: true },
  }).catch(() => null);

  if (!post) notFound();

  const meta = ARTICLE_META[slug] ?? {};

  // Fetch author from DB if we know the slug
  const author = meta.authorSlug
    ? await prisma.teacher.findUnique({ where: { slug: meta.authorSlug } }).catch(() => null)
    : null;

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── Back link ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 pt-10">
        <Link
          href="/teachings/dances/articles"
          className="inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
          style={{ color: "var(--fg3)" }}
        >
          ← Articles
        </Link>
      </div>

      {/* ── Article header ─────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-5 pt-8 pb-10">
        {meta.series && (
          <p className="eyebrow mb-4" style={{ color: "var(--gold-700)" }}>
            {meta.series}
          </p>
        )}

        <h1
          className="font-serif mb-6"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 400,
            color: "var(--ink-900)",
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            maxWidth: "18ch",
          }}
        >
          {post.title}
        </h1>

        {/* Author row */}
        {author && (
          <div className="flex items-center gap-3 mb-8">
            {author.photoUrl && (
              <img
                src={author.photoUrl}
                alt={author.name}
                className="rounded-full object-cover object-top"
                style={{ width: 44, height: 44 }}
              />
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--ink-800)" }}>
                {author.name}
              </p>
              {post.publishedAt && (
                <p className="text-xs" style={{ color: "var(--fg3)" }}>
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Gold rule */}
        <div style={{ height: 1, background: "var(--surface-border)" }} />
      </header>

      {/* ── Hero image ─────────────────────────────────────────── */}
      {meta.heroImage && (
        <div className="max-w-4xl mx-auto px-5 mb-12">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
            <Image
              src={meta.heroImage}
              alt={meta.heroAlt ?? post.title}
              width={1280}
              height={480}
              className="w-full object-cover"
              style={{ maxHeight: 420, objectPosition: "center 30%" }}
              priority
            />
          </div>
          {meta.heroAlt && (
            <p className="text-xs mt-2 text-center" style={{ color: "var(--fg3)" }}>
              {meta.heroAlt}
            </p>
          )}
        </div>
      )}

      {/* ── Article body ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-[1fr_260px] gap-12 items-start">

          {/* Prose */}
          <article>
            <div
              className="prose max-w-none"
              style={{
                "--tw-prose-body": "var(--fg1)",
                "--tw-prose-headings": "var(--ink-900)",
                "--tw-prose-links": "var(--crimson-700)",
                "--tw-prose-bold": "var(--ink-900)",
                "--tw-prose-quotes": "var(--lapis-700)",
                "--tw-prose-quote-borders": "var(--gold-400)",
                fontSize: "1.0625rem",
                lineHeight: "1.75",
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden md:block">
            {/* Author card */}
            {author && (
              <div
                className="rounded-2xl overflow-hidden mb-6"
                style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
              >
                <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
                <div className="p-5">
                  <p className="eyebrow mb-3" style={{ fontSize: "0.65rem", color: "var(--gold-600)" }}>About the author</p>
                  {author.photoUrl && (
                    <img
                      src={author.photoUrl}
                      alt={author.name}
                      className="rounded-xl object-cover w-full mb-3"
                      style={{ height: 280, objectPosition: "center top" }}
                    />
                  )}
                  <p className="font-serif mb-1" style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ink-900)" }}>
                    {author.name}
                  </p>
                  <p className="text-xs mb-3" style={{ color: "var(--gold-700)" }}>
                    Murshid · SamaSangha
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--fg2)" }}>
                    Senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace
                    lineages. Original mureed of Murshid Samuel Lewis.
                  </p>
                  <Link
                    href={`/about/teachers/${author.slug}`}
                    className="inline-block mt-3 text-xs underline underline-offset-2"
                    style={{ color: "var(--crimson-700)" }}
                  >
                    Full bio →
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
