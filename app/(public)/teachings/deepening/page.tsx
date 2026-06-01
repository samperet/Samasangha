import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Deepening" };
export const revalidate = 300;

export default async function DeepeningPage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "deepening" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Deepening</h1>
      {content ? (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            The Deepening programs offer sustained study and practice for those who feel
            called to go deeper into the Sufi path — through guided coursework, mentorship,
            and community.
          </p>
        </div>
      )}
    </div>
  );
}
