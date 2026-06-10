import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = { title: "Dance Articles" };
export const revalidate = 60;

async function getArticles() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "DANCE_ARTICLE" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function DanceArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-2">Articles</h1>
      <p className="text-stone-500 mb-12">
        Writings on the art, craft, and spiritual practice of the Dances of Universal Peace.
      </p>

      {articles.length === 0 ? (
        <p className="text-stone-400 italic">No articles posted yet.</p>
      ) : (
        <div className="space-y-8">
          {articles.map((a) => (
            <article key={a.id} className="border-b border-stone-100 pb-8">
              <Link href={`/teachings/dances/articles/${a.slug}`}>
                <h2 className="text-xl font-bold text-stone-800 hover:text-stone-600 transition-colors mb-2 leading-snug">
                  {a.title}
                </h2>
              </Link>
              {a.excerpt && (
                <p className="text-stone-500 text-sm leading-relaxed mb-3">{a.excerpt}</p>
              )}
              <Link
                href={`/teachings/dances/articles/${a.slug}`}
                className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors"
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
