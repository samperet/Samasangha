import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Lineage" };
export const revalidate = 300;

export default async function LineagePage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "lineage" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Our Lineage</h1>
      {content ? (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            Our community draws its inspiration and teachings from Hazrat Inayat Khan
            (1882–1927), the first teacher to bring Sufi teachings to the West. Born in
            India, Hazrat Inayat Khan was a musician and mystic who taught that music is
            the highest expression of the Divine.
          </p>
          <p>
            The Inayati Order — founded by Hazrat Inayat Khan — continues his work today,
            with centers around the world dedicated to the universal message of love,
            harmony, and beauty.
          </p>
          <p>
            The Dances of Universal Peace, a core practice in our community, were
            originated by Samuel Lewis (Murshid Sam), a direct student of Hazrat Inayat
            Khan, in San Francisco in the 1960s.
          </p>
        </div>
      )}
    </div>
  );
}
