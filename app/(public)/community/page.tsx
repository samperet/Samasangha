import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Community</h1>
      <p className="text-gray-500 mb-10">Photos, resources, and community connections.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/community/photos" className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
          <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">Photos</h2>
          <p className="text-gray-500 text-sm">Glimpses of our gatherings and community life.</p>
        </Link>
        <Link href="/community/resources" className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
          <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">Resources</h2>
          <p className="text-gray-500 text-sm">Recommended books, practices, and links for seekers.</p>
        </Link>
      </div>
    </div>
  );
}
