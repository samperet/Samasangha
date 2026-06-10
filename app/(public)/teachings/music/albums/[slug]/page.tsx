import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AlbumPlayer from "@/components/public/player/AlbumPlayer";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const albums = await prisma.album.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return albums.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.album.findUnique({ where: { slug } }).catch(() => null);
  return { title: album?.title ?? "Album" };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({
    where: { slug, published: true },
    include: { tracks: { orderBy: { order: "asc" } } },
  }).catch(() => null);

  if (!album) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Link
        href="/teachings/music/albums"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition-colors mb-10"
      >
        <span aria-hidden>←</span> All albums
      </Link>

      <AlbumPlayer
        album={{
          slug: album.slug,
          title: album.title,
          description: album.description,
          coverUrl: album.coverUrl,
          year: album.year,
          buyUrl: album.buyUrl,
          tracks: album.tracks.map((t) => ({
            id: t.id,
            title: t.title,
            duration: t.duration,
            audioUrl: t.audioUrl,
            order: t.order,
          })),
        }}
      />
    </div>
  );
}
