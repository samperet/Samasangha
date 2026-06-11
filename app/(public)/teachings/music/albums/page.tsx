import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AlbumCard, { type AlbumCardData } from "@/components/public/player/AlbumCard";

export const metadata: Metadata = { title: "Albums" };
export const revalidate = 60;

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      where: { published: true },
      include: { tracks: { orderBy: { order: "asc" } } },
      orderBy: { title: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AlbumsPage() {
  const albums = await getAlbums();

  // Full albums first, sample-only albums after
  const cards: AlbumCardData[] = albums
    .map((album) => {
      const isSample =
        album.tracks.length === 1 &&
        album.tracks[0].title.toLowerCase().includes("sample");
      return {
        slug: album.slug,
        title: album.title,
        coverUrl: album.coverUrl,
        year: album.year,
        trackCount: album.tracks.length,
        totalSeconds: album.tracks.reduce((s, t) => s + (t.duration ?? 0), 0),
        isSample,
        tracks: album.tracks.map((t) => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          audioUrl: t.audioUrl,
        })),
      };
    })
    .sort((a, b) => Number(a.isSample) - Number(b.isSample));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-2xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-700 mb-3">
          Music
        </p>
        <h1 className="font-serif text-5xl text-ink-900 leading-tight">Albums</h1>
        <p className="text-ink-700 mt-4 leading-relaxed">
          Recordings from SamaSangha and the Ruhaniat community — devotional chants, zikrs, and
          songs of remembrance. Press play on any album and keep listening as you explore the
          site. All music is offered freely; donations help us continue our work.
        </p>
        <Link
          href="/teachings/music/videos"
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-crimson-700 hover:text-crimson-900 underline underline-offset-4 decoration-crimson-700/30"
        >
          Watch music videos
          <span aria-hidden>→</span>
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="text-ink-600 italic mt-8">No albums published yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {cards.map((album) => (
            <AlbumCard key={album.slug} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
