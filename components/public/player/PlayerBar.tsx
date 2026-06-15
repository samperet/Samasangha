"use client";

import Link from "next/link";
import { usePlayer } from "./PlayerContext";
import { formatTime } from "./format";

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 5h2v14H6V5zm12.5.86v12.28c0 .79-.87 1.27-1.54.84l-9.6-6.14a1 1 0 0 1 0-1.68l9.6-6.14c.67-.43 1.54.05 1.54.84z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16 5h2v14h-2V5zM5.5 5.86v12.28c0 .79.87 1.27 1.54.84l9.6-6.14a1 1 0 0 0 0-1.68l-9.6-6.14c-.67-.43-1.54.05-1.54.84z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M8 5.14v13.72c0 .87.95 1.4 1.69.94l10.9-6.86a1.11 1.11 0 0 0 0-1.88L9.69 4.2C8.95 3.74 8 4.27 8 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M4 9v6h3.8l4.7 3.9a.75.75 0 0 0 1.23-.58V5.68a.75.75 0 0 0-1.23-.58L7.8 9H4z" />
      {!muted && (
        <path d="M16.5 8.5a4.9 4.9 0 0 1 0 7M18.6 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
      {muted && (
        <path d="M16 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    close,
    queue,
    index,
  } = usePlayer();

  if (!current) return null;

  const total = duration || current.duration || 0;
  const progress = total > 0 ? (currentTime / total) * 100 : 0;

  return (
    <div className="player-bar-enter fixed bottom-0 inset-x-0 z-50">
      {/* Seek bar, full-width strip along the top edge */}
      <div
        className="group relative h-2.5 -mb-1 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - rect.left) / rect.width) * total);
        }}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(currentTime)}
      >
        <div className="absolute inset-x-0 bottom-1 h-[3px] bg-[#3d3527] group-hover:h-[6px] transition-all">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="border-t border-[#3d3527]/60 px-4 sm:px-6"
        style={{ background: "rgba(28, 23, 16, 0.97)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto h-[76px] flex items-center gap-4">
          {/* Now playing */}
          <Link
            href={`/teachings/music/albums/${current.albumSlug}`}
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-72 group"
          >
            {current.coverUrl && (
              <img
                src={current.coverUrl}
                alt=""
                className="w-12 h-12 rounded-md object-cover shadow-md shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-[#f4ead2] text-sm font-semibold truncate">{current.title}</p>
              <p className="text-gold-400/80 text-xs truncate group-hover:text-gold-300 transition-colors">
                {current.albumTitle}
              </p>
            </div>
          </Link>

          {/* Transport */}
          <div className="flex items-center gap-2 sm:gap-3 mx-auto">
            <button
              onClick={prev}
              disabled={index === 0 && currentTime <= 4}
              className="p-2 text-[#cbbf9f] hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Previous track"
            >
              <PrevIcon />
            </button>
            <button
              onClick={toggle}
              className="w-11 h-11 rounded-full bg-gold-500 text-[#2a2118] hover:bg-gold-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={next}
              disabled={index >= queue.length - 1}
              className="p-2 text-[#cbbf9f] hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Next track"
            >
              <NextIcon />
            </button>
          </div>

          {/* Time + volume + close */}
          <div className="hidden sm:flex items-center gap-4 w-72 justify-end">
            <span className="text-xs tabular-nums text-[#9a8e74]">
              {formatTime(currentTime)} / {formatTime(total)}
            </span>
            <div className="hidden md:flex items-center gap-2 text-[#cbbf9f]">
              <button
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                aria-label={volume === 0 ? "Unmute" : "Mute"}
                className="hover:text-white transition-colors"
              >
                <VolumeIcon muted={volume === 0} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="player-volume w-28"
                aria-label="Volume"
              />
            </div>
            <button
              onClick={close}
              className="text-[#9a8e74] hover:text-white transition-colors text-lg leading-none px-1"
              aria-label="Close player"
            >
              ×
            </button>
          </div>

          {/* Mobile close */}
          <button
            onClick={close}
            className="sm:hidden text-[#9a8e74] hover:text-white text-lg leading-none px-1"
            aria-label="Close player"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
