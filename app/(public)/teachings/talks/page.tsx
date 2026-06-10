import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Talks" };
export const revalidate = 60;

async function getTalks() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "TALK" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function TalksPage() {
  const talks = await getTalks();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-2">Talks & Recordings</h1>
      <p className="text-stone-500 mb-12">
        Teachings and talks from Abraham, Halima, and the wider Ruhaniat community.
      </p>

      {talks.length === 0 ? (
        <p className="text-stone-400 italic">No talks posted yet.</p>
      ) : (
        <div className="space-y-8">
          {talks.map((talk) => (
            <article key={talk.id} className="border-b border-stone-100 pb-8">
              {talk.publishedAt && (
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">
                  {formatDate(talk.publishedAt)}
                </p>
              )}
              <Link href={`/teachings/talks/${talk.slug}`}>
                <h2 className="text-xl font-bold text-stone-800 hover:text-teal-700 transition-colors mb-2 leading-snug">
                  {talk.title}
                </h2>
              </Link>
              {talk.excerpt && (
                <p className="text-stone-500 text-sm leading-relaxed mb-3">{talk.excerpt}</p>
              )}
              <Link
                href={`/teachings/talks/${talk.slug}`}
                className="text-sm text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
