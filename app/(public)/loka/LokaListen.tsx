"use client";

import { useEffect, useRef, useState } from "react";

type ListenHandle = { play: () => void; pause: () => void; destroy: () => void } | null;

// "Listen to the song first" — the same Lokah Choir singalong (scrolling
// subtitles + bouncing marker), play/pause only, no recording.
export default function LokaListen() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ListenHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    import("./lokah-recorder.js")
      .then(({ createLokahRecorder }) => {
        if (cancelled) return;
        handleRef.current = createLokahRecorder(host, {
          loopUrl: "/lokah/loop.mp3",
          ballUrl: "/lokah/ball.png",
          showControls: false,
          collectName: false,
        });
        setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      try {
        handleRef.current?.destroy();
      } catch {
        /* noop */
      }
      handleRef.current = null;
    };
  }, []);

  function toggle() {
    const h = handleRef.current;
    if (!h) return;
    if (playing) {
      h.pause();
      setPlaying(false);
    } else {
      h.play();
      setPlaying(true);
    }
  }

  return (
    <div>
      <div ref={hostRef} />
      <button
        onClick={toggle}
        disabled={!ready}
        className="w-full mt-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        style={{
          padding: "0.9rem 1.25rem",
          fontSize: "1.1rem",
          background: "var(--parch-100)",
          border: "1px solid var(--surface-border)",
          color: "var(--ink-700)",
        }}
      >
        {playing ? "Pause" : ready ? "Play the song" : "Loading the song…"}
      </button>
    </div>
  );
}
