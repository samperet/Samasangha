import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Music" };

export default function MusicPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Music</h1>
      <p className="text-gray-500 mb-10 text-lg">
        Sacred music is central to the Sufi path — a vehicle for the remembrance of the Divine.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/teachings/music/albums" className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
          <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">Albums</h2>
          <p className="text-gray-500 text-sm">Listen to and purchase recordings from our community.</p>
        </Link>
        <Link href="/teachings/music/videos" className="block p-6 border rounded-lg hover:shadow-md transition-shadow group">
          <h2 className="font-bold text-[#1a2744] text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">Videos</h2>
          <p className="text-gray-500 text-sm">Music videos and live performance recordings.</p>
        </Link>
      </div>
    </div>
  );
}
