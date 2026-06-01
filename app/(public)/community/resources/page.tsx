import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Resources" };
export const revalidate = 60;

async function getResources() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "RESOURCE" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Resources</h1>
      <p className="text-gray-500 mb-10">Recommended readings, practices, and links for seekers.</p>
      {resources.length === 0 ? (
        <p className="text-gray-400 italic">Resources coming soon.</p>
      ) : (
        <div className="space-y-8">
          {resources.map((r) => (
            <article key={r.id} className="border-b pb-8">
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{r.title}</h2>
              {r.excerpt && <p className="text-gray-600 text-sm mb-3">{r.excerpt}</p>}
              <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: r.content }} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
