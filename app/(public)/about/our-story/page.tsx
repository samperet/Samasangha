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
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Our Story</h1>
      {content ? (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            SamaSangha — meaning &ldquo;community of listening&rdquo; — is the local sangha of the
            Northeast Sufi Circle, a regional center of the Inayati Order in Massachusetts.
          </p>
          <p>
            For decades, seekers in the Greater Boston area have gathered to practice
            zikr (the remembrance of God), study Sufi teachings, dance the Dances of
            Universal Peace, and support one another on the mystical path.
          </p>
          <p>
            Our community is open-hearted, non-dogmatic, and welcoming to all who feel
            called to the path of love, harmony, and beauty — regardless of background
            or tradition.
          </p>
        </div>
      )}
    </div>
  );
}
