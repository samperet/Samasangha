"use client";

import { useEffect, useRef, useState } from "react";

const REPEAT = 200;

// A line of repeating "HEART" whose horizontal position is driven by the
// page's scroll position. direction "rtl" crawls right→left as you scroll
// down; "ltr" crawls left→right. The strip is far wider than the viewport
// and only shifts within one tile width (wrapped by modulo), so it reads as a
// seamless, endless ribbon with no visible edges.
export default function HeartTicker({ direction }: { direction: "rtl" | "ltr" }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [tile, setTile] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (el) setTile(el.scrollWidth / REPEAT);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      setOffset(window.scrollY * 0.35);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const wrapped = tile > 0 ? ((offset % tile) + tile) % tile : 0;
  const x = direction === "rtl" ? -wrapped : wrapped - tile;

  return (
    <div className="overflow-hidden">
      <p
        ref={ref}
        aria-label="HEART"
        className="font-serif"
        style={{
          color: "var(--gold-400)",
          opacity: 0.75,
          fontSize: "0.95rem",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          transform: `translateX(${x}px)`,
          willChange: "transform",
        }}
      >
        {"HEART".repeat(REPEAT)}
      </p>
    </div>
  );
}
