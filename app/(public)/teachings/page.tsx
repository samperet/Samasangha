import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Teachings" };

const sections = [
  { title: "Dharma Gems", href: "/teachings/dharma-gems", desc: "Short teachings and reflections from the tradition." },
  { title: "Tuesday Practice", href: "/teachings/tuesday-practice", desc: "Our weekly online practice gathering." },
  { title: "Talks", href: "/teachings/talks", desc: "Recordings and transcripts of teachings." },
  { title: "Deepening", href: "/teachings/deepening", desc: "Programs for sustained study and practice." },
  { title: "Dances of Universal Peace", href: "/teachings/dances", desc: "Sacred circle dances from world traditions." },
  { title: "Music", href: "/teachings/music", desc: "Albums, tracks, and music videos." },
];

export default function TeachingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Teachings</h1>
      <p className="text-gray-500 mb-10">
        Explore the wisdom, practices, and music of our community.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
            <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">{s.title}</h2>
            <p className="text-gray-500 text-sm">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
