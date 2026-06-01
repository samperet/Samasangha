import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Tuesday Practice" };
export const revalidate = 300;

export default async function TuesdayPracticePage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "tuesday-practice" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Tuesday Practice</h1>
      {content ? (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            Every Tuesday evening, our community gathers online for a shared practice
            session including zikr (remembrance), meditation, and study of Sufi teachings.
          </p>
          <p>
            This is an open gathering — all sincere seekers are welcome. Details and Zoom
            link are shared via our mailing list.
          </p>
          <p>
            To receive the link, please <a href="/contact" className="text-[#c9a84c]">contact us</a> or sign up for our mailing list below.
          </p>
        </div>
      )}
    </div>
  );
}
