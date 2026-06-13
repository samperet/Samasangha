import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dance Interviews" };
export const revalidate = 60;

async function getInterviews() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "DANCE_INTERVIEW" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function DanceInterviewsPage() {
  const interviews = await getInterviews();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Interviews</h1>
      {interviews.length === 0 ? (
        <p className="text-gray-400 italic">No interviews posted yet.</p>
      ) : (
        <div className="space-y-8">
          {interviews.map((i) => (
            <article key={i.id} className="border-b pb-8">
              <p className="text-[#c9a84c] text-xs mb-1">{i.publishedAt ? formatDate(i.publishedAt) : ""}</p>
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{i.title}</h2>
              {i.excerpt && <p className="text-gray-600 text-sm mb-3">{i.excerpt}</p>}
              <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: i.content }} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
