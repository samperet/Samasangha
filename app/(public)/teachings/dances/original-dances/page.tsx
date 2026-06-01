import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Original Dances" };
export const revalidate = 60;

async function getDances() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "ORIGINAL_DANCE" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function OriginalDancesPage() {
  const dances = await getDances();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Original Dances</h1>
      {dances.length === 0 ? (
        <p className="text-gray-400 italic">No original dances posted yet.</p>
      ) : (
        <div className="space-y-6">
          {dances.map((d) => (
            <article key={d.id} className="border-b pb-6">
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{d.title}</h2>
              {d.excerpt && <p className="text-gray-600 text-sm">{d.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
