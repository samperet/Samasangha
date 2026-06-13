"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PlayerBar from "./PlayerBar";

export type PlayerTrack = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number | null;
  albumTitle: string;
  albumSlug: string;
  coverUrl: string | null;
};

type PlayerContextValue = {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const current = queue[index] ?? null;

  const loadAndPlay = useCallback((track: PlayerTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.audioUrl;
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const playQueue = useCallback(
    (tracks: PlayerTrack[], startIndex = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setIndex(startIndex);
      setCurrentTime(0);
      loadAndPlay(tracks[startIndex]);
    },
    [loadAndPlay]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const skipTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= queue.length) return;
      indexRef.current = i;
      setIndex(i);
      setCurrentTime(0);
      loadAndPlay(queue[i]);
    },
    [queue, loadAndPlay]
  );

  const next = useCallback(() => skipTo(indexRef.current + 1), [skipTo]);
  const prev = useCallback(() => {
    const audio = audioRef.current;
    // Restart current track if we're more than a few seconds in
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      return;
    }
    skipTo(indexRef.current - 1);
  }, [skipTo]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    setVolumeState(v);
    if (audio) audio.volume = v;
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setQueue([]);
    setIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIndex((i) => {
        if (i + 1 < queue.length) {
          loadAndPlay(queue[i + 1]);
          return i + 1;
        }
        setIsPlaying(false);
        return i;
      });
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [queue, loadAndPlay]);

  // Media Session API, lock screen / hardware key controls
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: "Sama Sangha",
      album: current.albumTitle,
      artwork: current.coverUrl
        ? [{ src: current.coverUrl, sizes: "512x512" }]
        : [],
    });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("previoustrack", prev);
    navigator.mediaSession.setActionHandler("nexttrack", next);
  }, [current, prev, next]);

  // Spacebar toggles playback (unless typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !current) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, toggle]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      index,
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      close,
    }),
    [queue, index, current, isPlaying, currentTime, duration, volume, playQueue, toggle, next, prev, seek, setVolume, close]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Spacer so fixed bar never covers page content */}
      {current && <div className="h-24" aria-hidden />}
      <audio ref={audioRef} preload="metadata" />
      <PlayerBar />
    </PlayerContext.Provider>
  );
}
