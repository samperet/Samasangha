import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Articles on the Dances</h1>
      {articles.length === 0 ? (
        <p className="text-gray-400 italic">No articles posted yet.</p>
      ) : (
        <div className="space-y-8">
          {articles.map((a) => (
            <article key={a.id} className="border-b pb-8">
              <p className="text-[#c9a84c] text-xs mb-1">{a.publishedAt ? formatDate(a.publishedAt) : ""}</p>
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{a.title}</h2>
              {a.excerpt && <p className="text-gray-600 text-sm mb-3">{a.excerpt}</p>}
              <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: a.content }} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
