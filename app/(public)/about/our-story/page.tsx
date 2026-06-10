import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Our Story" };
export const revalidate = 300;

export default async function OurStoryPage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "our-story" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-10">Our Story</h1>
      {content ? (
        <div
          className="prose prose-stone max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-stone-400 italic">Coming soon.</p>
      )}
    </div>
  );
}
