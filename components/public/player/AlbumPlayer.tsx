"use client";

import { useEffect, useState } from "react";
import { usePlayer, type PlayerTrack } from "./PlayerContext";
import EqBars from "./EqBars";
import { formatTime } from "./format";

// Matches the donation button used in the Footer and retreat registration.
const DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=77ADFBGTTU2QE";

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shown when the visitor clicks Download: a gentle dana invitation that offers
// both the donate link and the actual download link side by side.
function DownloadModal({
  downloadHref,
  isSample,
  label,
  onClose,
}: {
  downloadHref: string;
  isSample: boolean;
  label: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(26, 18, 8, 0.55)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download by donation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-4 text-xl leading-none"
          style={{ color: "var(--fg3)" }}
        >
          ×
        </button>

        <p className="text-3xl mb-3" aria-hidden style={{ color: "var(--gold-500)" }}>♥</p>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--fg2)" }}>
          This music is shared freely with our community and supported by your generosity.
          If it moves you, please consider a gift of dana, then download with our blessing.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-md hover:-translate-y-px active:translate-y-0 transition-all"
            style={{ background: "var(--crimson-700)", color: "#fff" }}
          >
            <span aria-hidden>♡</span>
            Make a donation
          </a>

          <a
            href={downloadHref}
            {...(isSample ? { download: "" } : {})}
            onClick={() => setTimeout(onClose, 150)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border transition-all hover:bg-parch-100"
            style={{ borderColor: "rgba(42,33,24,0.18)", color: "var(--ink-800)" }}
          >
            <DownloadIcon />
            {label}
          </a>
        </div>

        <p className="text-xs mt-5" style={{ color: "var(--fg3)" }}>
          No gift is required. The download link is right above.
        </p>
      </div>
    </div>
  );
}

export type AlbumData = {
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  year: number | null;
  buyUrl: string | null;
  tracks: { id: string; title: string; duration: number | null; audioUrl: string | null; order: number }[];
};

export default function AlbumPlayer({ album }: { album: AlbumData }) {
  const { current, isPlaying, playQueue, toggle } = usePlayer();
  const [download, setDownload] = useState<{ href: string; isSample: boolean; label: string } | null>(null);

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

  const totalSeconds = album.tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const isSample = playable.length === 1 && playable[0].title.toLowerCase().includes("sample");
  const albumIsCurrent = current !== null && playable.some((t) => t.id === current.id);

  const handlePlayAlbum = () => {
    if (albumIsCurrent) toggle();
    else playQueue(playable, 0);
  };

  const handlePlayTrack = (trackId: string) => {
    const i = playable.findIndex((t) => t.id === trackId);
    if (i === -1) return;
    if (current?.id === trackId) toggle();
    else playQueue(playable, i);
  };

  return (
    <div>
      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-center sm:items-end mb-12">
        {album.coverUrl && (
          <div className="relative shrink-0">
            <div
              className="absolute -inset-3 rounded-2xl opacity-40 blur-2xl"
              style={{ backgroundImage: `url(${album.coverUrl})`, backgroundSize: "cover" }}
              aria-hidden
            />
            <img
              src={album.coverUrl}
              alt={album.title}
              className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-xl object-cover shadow-[0_20px_50px_rgba(42,33,24,0.35)]"
            />
          </div>
        )}
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700 mb-2">
            {isSample ? "Album · Sample" : "Album"}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 leading-tight">{album.title}</h1>
          <p className="text-sm text-ink-600 mt-2">
            Sama Sangha
            {album.year ? ` · ${album.year}` : ""}
            {playable.length > 1 ? ` · ${album.tracks.length} tracks, ${totalMinutes} min` : ""}
          </p>
          {album.description && (
            <p className="text-[0.95rem] text-ink-700 leading-relaxed mt-4 max-w-xl">{album.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
            {playable.length > 0 && (
              <button
                onClick={handlePlayAlbum}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-gold-600 hover:bg-gold-500 text-[#2a2118] font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all"
              >
                {albumIsCurrent && isPlaying ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M8 5.14v13.72c0 .87.95 1.4 1.69.94l10.9-6.86a1.11 1.11 0 0 0 0-1.88L9.69 4.2C8.95 3.74 8 4.27 8 5.14z" />
                    </svg>
                    {isSample ? "Play Sample" : "Play Album"}
                  </>
                )}
              </button>
            )}

            {playable.length > 0 && (
              <button
                onClick={() =>
                  setDownload({
                    href: isSample ? playable[0].audioUrl : `/api/music/${album.slug}/download`,
                    isSample,
                    label: isSample ? "Download sample" : "Download album",
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ink-900/15 text-ink-800! font-semibold text-sm hover:border-ink-900/30 hover:bg-parch-100 transition-all"
              >
                <DownloadIcon />
                {isSample ? "Download sample" : "Download album"}
              </button>
            )}
          </div>

        </div>
      </div>

      {download && (
        <DownloadModal
          downloadHref={download.href}
          isSample={download.isSample}
          label={download.label}
          onClose={() => setDownload(null)}
        />
      )}

      {/* Track list */}
      <div className="rounded-2xl border border-surface-border bg-white/70 shadow-sm overflow-hidden">
        <ul className="divide-y divide-[#f0e8d4]">
          {album.tracks.map((track, i) => {
            const isCurrent = current?.id === track.id;
            const canPlay = !!track.audioUrl;
            return (
              <li
                key={track.id}
                className={`group flex items-center gap-3 pr-3 transition-colors ${
                  isCurrent ? "bg-gold-100/70" : canPlay ? "hover:bg-parch-100/80" : "opacity-50"
                }`}
              >
                <button
                  onClick={() => canPlay && handlePlayTrack(track.id)}
                  disabled={!canPlay}
                  className="flex items-center gap-4 flex-1 min-w-0 px-5 py-3.5 text-left"
                >
                  <span className="w-7 shrink-0 flex items-center justify-center">
                    {isCurrent ? (
                      <EqBars paused={!isPlaying} />
                    ) : (
                      <>
                        <span className="text-sm text-ink-600/60 tabular-nums group-hover:hidden">
                          {i + 1}
                        </span>
                        {canPlay && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 text-gold-700 hidden group-hover:block"
                          >
                            <path d="M8 5.14v13.72c0 .87.95 1.4 1.69.94l10.9-6.86a1.11 1.11 0 0 0 0-1.88L9.69 4.2C8.95 3.74 8 4.27 8 5.14z" />
                          </svg>
                        )}
                      </>
                    )}
                  </span>
                  <span
                    className={`flex-1 min-w-0 truncate text-[0.95rem] ${
                      isCurrent ? "text-gold-900 font-semibold" : "text-ink-800"
                    }`}
                  >
                    {track.title}
                  </span>
                </button>
                {track.duration != null && (
                  <span className="text-xs tabular-nums text-ink-600/60 shrink-0">
                    {formatTime(track.duration)}
                  </span>
                )}
                {canPlay && (
                  <button
                    onClick={() =>
                      setDownload({
                        href: `/api/music/track/${track.id}/download`,
                        isSample: false,
                        label: "Download song",
                      })
                    }
                    aria-label={`Download ${track.title}`}
                    title="Download track"
                    className="shrink-0 p-2 rounded-md text-ink-600/45! hover:text-gold-700! hover:bg-gold-100 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-all"
                  >
                    <DownloadIcon className="w-[18px] h-[18px]" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {isSample && (
        <p className="text-sm text-ink-600 mt-5 italic">
          Only a sample of this album is available to stream, the full recording is offered through
          the community by donation{album.buyUrl ? "" : "."}
          {album.buyUrl && (
            <>
              {" "}
              via the{" "}
              <a href={album.buyUrl} target="_blank" rel="noopener noreferrer" className="not-italic">
                original album page ↗
              </a>
              .
            </>
          )}
        </p>
      )}
    </div>
  );
}
