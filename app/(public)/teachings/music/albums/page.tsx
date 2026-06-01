import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Albums" };
export const revalidate = 60;

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      where: { published: true },
      include: { tracks: { orderBy: { order: "asc" } } },
      orderBy: { year: "desc" },
    });
  } catch {
    return [];
  }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Albums</h1>
      {albums.length === 0 ? (
        <p className="text-gray-400 italic">No albums published yet.</p>
      ) : (
        <div className="space-y-12">
          {albums.map((album) => (
            <section key={album.id} className="flex flex-col md:flex-row gap-6">
              {album.coverUrl && (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-40 h-40 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1a2744]">{album.title}</h2>
                {album.year && <p className="text-[#c9a84c] text-sm">{album.year}</p>}
                {album.description && <p className="text-gray-600 text-sm mt-2 mb-4">{album.description}</p>}
                {album.tracks.length > 0 && (
                  <ul className="divide-y text-sm">
                    {album.tracks.map((track) => (
                      <li key={track.id} className="py-2 flex items-center gap-3">
                        <span className="text-gray-400 w-6">{track.order}.</span>
                        <span className="flex-1">{track.title}</span>
                        {track.duration && (
                          <span className="text-gray-400">{formatDuration(track.duration)}</span>
                        )}
                        {track.audioUrl && (
                          <audio controls src={track.audioUrl} className="h-8" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {album.buyUrl && (
                  <a
                    href={album.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8973b] text-white text-sm rounded"
                  >
                    Buy / Stream
                  </a>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
