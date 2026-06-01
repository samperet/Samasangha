import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Cambridge Dances" };
export const revalidate = 300;

export default async function CambridgeDancesPage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "dances-cambridge" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Cambridge Dances</h1>
      {content ? (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>Information about our Cambridge-area Dances of Universal Peace gatherings coming soon.</p>
          <p>Please <a href="/contact" className="text-[#c9a84c]">contact us</a> to be added to the mailing list for event announcements.</p>
        </div>
      )}
    </div>
  );
}
