import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Weekly Practice" };
export const revalidate = 300;

export default async function TuesdayPracticePage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "tuesday-practice" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-10">Weekly Practice</h1>
      {content ? (
        <div
          className="prose prose-stone max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-stone-400 italic">Details coming soon.</p>
      )}
    </div>
  );
}
