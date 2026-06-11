"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Community photos (section 2). Thumbnails load on the page; the larger `-lg`
// version loads only when the lightbox opens for that image.
const IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  thumb: `/assets/community/community-${n}.jpg`,
  full: `/assets/community/community-${n}-lg.jpg`,
}));

const LEFT = [0, 1, 2, 3];
const RIGHT = [4, 5, 6, 7];
const BOTTOM = [8, 9]; // the two photos beneath the textbox

function PhotoButton({ i, onOpen }: { i: number; onOpen: (i: number) => void }) {
  return (
    <button
      onClick={() => onOpen(i)}
      aria-label="Open photo"
      className="group block overflow-hidden rounded-xl shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGES[i].thumb}
        alt="SamaSangha community"
        loading="lazy"
        className="w-full aspect-[4/3] object-cover transition duration-300 group-hover:scale-[1.05] group-hover:brightness-105 cursor-pointer"
      />
    </button>
  );
}

function PhotoColumn({
  indices,
  onOpen,
}: {
  indices: number[];
  onOpen: (i: number) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-44 xl:w-52 shrink-0">
      {indices.map((i) => (
        <PhotoButton key={i} i={i} onOpen={onOpen} />
      ))}
    </aside>
  );
}

export default function CommunityCollage({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % IMAGES.length)),
    []
  );
  const prev = useCallback(
    () => setOpen((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length)),
    []
  );

  // Keyboard controls + body scroll lock while the lightbox is open
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next, prev]);

  return (
    <>
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-center gap-4 lg:gap-6">
        <PhotoColumn indices={LEFT} onOpen={setOpen} />
        {/* Center column: the card, with two photos beneath the textbox */}
        <div className="w-full max-w-[480px] shrink-0 flex flex-col gap-4">
          {children}
          <div className="grid grid-cols-2 gap-4">
            {BOTTOM.map((i) => (
              <PhotoButton key={i} i={i} onOpen={setOpen} />
            ))}
          </div>
        </div>
        <PhotoColumn indices={RIGHT} onOpen={setOpen} />
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(20, 16, 10, 0.92)", backdropFilter: "blur(4px)" }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES[open].full}
            alt="SamaSangha community"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[86vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
          />

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight size={40} />
          </button>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tracking-wide text-white/60">
            {open + 1} / {IMAGES.length}
          </p>
        </div>
      )}
    </>
  );
}
