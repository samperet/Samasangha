import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dances of Universal Peace" };
export const revalidate = 300;

export default async function DancesPage() {
  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "dances" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Dances of Universal Peace</h1>
      <p className="text-gray-500 mb-8 text-lg">
        Sacred circle dances drawing from spiritual traditions around the world.
      </p>

      {content ? (
        <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="prose prose-lg max-w-none mb-12 text-gray-600">
          <p>
            The Dances of Universal Peace are simple, accessible circle dances using
            sacred phrases, chants, and movements from the world&apos;s spiritual traditions —
            Hindu, Buddhist, Sufi, Christian, Jewish, and Indigenous.
          </p>
          <p>
            Originated by Samuel Lewis (Murshid Sam) in San Francisco in the late 1960s,
            the Dances are practiced in over 60 countries as a path of peace and unity.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Cambridge Dances", href: "/teachings/dances/cambridge", desc: "Our local dance gatherings in the Cambridge area." },
          { title: "Original Dances", href: "/teachings/dances/original-dances", desc: "Dances created within our community lineage." },
          { title: "Articles", href: "/teachings/dances/articles", desc: "Writings about the Dances of Universal Peace." },
          { title: "Interviews", href: "/teachings/dances/interviews", desc: "Conversations with dance leaders and teachers." },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
            <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">{card.title}</h2>
            <p className="text-gray-500 text-sm">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
