"use client";

import Link from "next/link";
import { usePlayer, type PlayerTrack } from "./PlayerContext";
import EqBars from "./EqBars";

export type AlbumCardData = {
  slug: string;
  title: string;
  coverUrl: string | null;
  year: number | null;
  trackCount: number;
  totalSeconds: number;
  isSample: boolean;
  tracks: { id: string; title: string; duration: number | null; audioUrl: string | null }[];
};

export default function AlbumCard({ album }: { album: AlbumCardData }) {
  const { current, isPlaying, playQueue, toggle } = usePlayer();

  const playable: PlayerTrack[] = album.tracks
    .filter((t) => t.audioUrl)
    .map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl!,
      duration: t.duration,
      albumTitle: album.title,
      albumSlug: album.slug,
      coverUrl: album.coverUrl,
    }));

  const albumIsCurrent = current !== null && playable.some((t) => t.id === current.id);
  const minutes = Math.round(album.totalSeconds / 60);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (albumIsCurrent) toggle();
    else if (playable.length) playQueue(playable, 0);
  };

  return (
    <Link
      href={`/teachings/music/albums/${album.slug}`}
      className="group block"
      aria-label={album.title}
    >
      <div className="relative rounded-xl overflow-hidden shadow-md group-hover:shadow-[0_18px_40px_rgba(42,33,24,0.28)] transition-shadow duration-300">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt=""
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full aspect-square bg-parch-200 flex items-center justify-center text-5xl text-ink-600/30">
            ♪
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1710]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {playable.length > 0 && (
          <button
            onClick={handlePlay}
            aria-label={albumIsCurrent && isPlaying ? `Pause ${album.title}` : `Play ${album.title}`}
            className={`absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gold-500 text-[#2a2118] shadow-lg flex items-center justify-center
              hover:bg-gold-400 hover:scale-105 active:scale-95 transition-all duration-200
              ${albumIsCurrent ? "opacity-100" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}`}
          >
            {albumIsCurrent && isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8 5.14v13.72c0 .87.95 1.4 1.69.94l10.9-6.86a1.11 1.11 0 0 0 0-1.88L9.69 4.2C8.95 3.74 8 4.27 8 5.14z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="mt-3.5 px-0.5">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl text-ink-900 leading-snug group-hover:text-gold-900 transition-colors">
            {album.title}
          </h2>
          {albumIsCurrent && <EqBars paused={!isPlaying} />}
        </div>
        <p className="text-xs text-ink-600/80 mt-1">
          {album.year ? `${album.year} · ` : ""}
          {album.isSample
            ? "Album sample"
            : `${album.trackCount} tracks · ${minutes} min`}
        </p>
      </div>
    </Link>
  );
}
