import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">About SamaSangha</h1>
      <p className="text-gray-600 mb-10 text-lg">
        We are a community of seekers walking the Sufi path of love, harmony, and beauty.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Our Story", href: "/about/our-story", desc: "How SamaSangha came to be and what we stand for." },
          { title: "Our Teachers", href: "/about/teachers", desc: "Meet the guides and teachers of our community." },
          { title: "Lineage", href: "/about/lineage", desc: "The Inayati Order and the wisdom of Hazrat Inayat Khan." },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
            <h2 className="font-bold text-[#1a2744] text-xl mb-2 group-hover:text-[#c9a84c] transition-colors">{card.title}</h2>
            <p className="text-gray-600 text-sm">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
