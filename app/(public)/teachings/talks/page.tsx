import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-2">Talks & Recordings</h1>
      <p className="text-gray-500 mb-10">Teachings and talks from our teachers and community.</p>
      {talks.length === 0 ? (
        <p className="text-gray-400 italic">No talks posted yet.</p>
      ) : (
        <div className="space-y-8">
          {talks.map((talk) => (
            <article key={talk.id} className="border-b pb-8">
              <p className="text-[#c9a84c] text-xs font-medium mb-1">
                {talk.publishedAt ? formatDate(talk.publishedAt) : ""}
              </p>
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{talk.title}</h2>
              {talk.excerpt && <p className="text-gray-600 mb-3">{talk.excerpt}</p>}
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: talk.content }}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
