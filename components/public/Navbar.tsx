"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const SearchOverlay = dynamic(() => import("./SearchOverlay"), { ssr: false });

// ── Content ────────────────────────────────────────────────────────────────

// "Welcome" is a simple link to the About/Teachers page (no dropdown).
const DISCOVER = {
  label: "Welcome",
  context: "Learn about the path and the lineage",
} as const;

// "Teachings" is a plain link to the filterable teachings list (no dropdown).

// Tiny gold heart separator, SVG so we can control the roundness fully
function NavHeart() {
  return (
    <svg aria-hidden width="10" height="10" viewBox="0 0 20 18" fill="var(--gold-500)" style={{ opacity: 0.75, flexShrink: 0 }}>
      <path d="M10 17 C10 17 1 11 1 5.5 A4.5 4.5 0 0 1 10 3.8 A4.5 4.5 0 0 1 19 5.5 C19 11 10 17 10 17Z" />
    </svg>
  );
}

// ── Art-deco corner brackets, four thin double-line accents that frame a
// menu item. Purely decorative; styled by the .deco-* classes in globals.css.
function DecoCorners() {
  return (
    <>
      <span aria-hidden className="deco-corner top left" />
      <span aria-hidden className="deco-corner top right" />
      <span aria-hidden className="deco-corner bottom left" />
      <span aria-hidden className="deco-corner bottom right" />
    </>
  );
}

// Desktop menu item, serif text framed by art-deco corners. Padding gives the
// frame room around the label; lineHeight 1 keeps the box compact in the 44px bar.
const DESKTOP_ITEM: React.CSSProperties = {
  fontSize: "1.45rem",
  fontWeight: 700,
  color: "var(--ink-800)",
  textDecoration: "none",
  letterSpacing: "0.01em",
  lineHeight: 1,
  padding: "0.2rem 1.05rem",
};

// Mobile menu item, large text + roomy padding so the tap target clears the
// ~44px accessibility minimum, comfortable for older users.
const MOBILE_ITEM: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 700,
  color: "var(--ink-800)",
  textDecoration: "none",
  lineHeight: 1.2,
  padding: "0.6rem 0.75rem",
  display: "inline-block",
};

// ── Main Navbar ────────────────────────────────────────────────────────────

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // ── Hidden admin entrance: triple-click the heart to reach the login.
  // Single clicks navigate home after a short pause so the clicks can accumulate.
  const heartClicks = useRef(0);
  const heartClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHeartClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      heartClicks.current += 1;
      if (heartClickTimer.current) clearTimeout(heartClickTimer.current);
      heartClickTimer.current = setTimeout(() => {
        const clicks = heartClicks.current;
        heartClicks.current = 0;
        router.push(clicks >= 3 ? "/admin/events" : "/");
      }, 350);
    },
    [router]
  );

  // ── Heart gently shrinks as the page scrolls down (imperative, no re-render)
  // Only the heart scales, the blue halo behind it stays put.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const s = 1 - (Math.min(window.scrollY, 180) / 180) * 0.18; // 1 → 0.82
      if (heartRef.current) heartRef.current.style.transform = `scale(${s})`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Open search with Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Header chrome: blue temple texture ── */}
      <div
        className="relative z-[60] px-4 sm:px-10 py-4"
        style={{
          backgroundColor: "#0e2b3a",
          backgroundImage:
            "linear-gradient(rgba(13,43,58,0.10), rgba(13,43,58,0.10)), url('/assets/BlueTemple.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      {/* ── Winged heart + wordmark, in a see-through white panel (no blur) so
            the temple texture shows through it and around its edges ── */}
      <div
        className="flex justify-center items-center w-full"
        style={{
          background: "rgba(255,255,255,0.55)",
          padding: "1rem 2rem 1.6rem",
        }}
      >
        <Link
          href="/"
          aria-label="SamaSangha home"
          className="relative inline-flex items-center justify-center gap-2 sm:gap-4 lg:gap-5"
          onClick={onHeartClick}
        >
          {/* "Sama", left of the heart. The left padding equals the width
              difference vs. "Sangha" (in em, so it scales with the font), which
              balances the two sides and centers the heart on the page. */}
          <span
            className="leading-none select-none text-2xl sm:text-4xl lg:text-6xl"
            style={{ fontFamily: "var(--font-sama)", color: "#2c4264", paddingLeft: "1.115em", textShadow: "0 1px 12px rgba(247,238,219,0.95)" }}
          >
            Sama
          </span>

          {/* Heart + halo, kept as a centered unit. Lifted above the sticky
              header (z-50) so the halo's bottom isn't clipped by the menu bar. */}
          <span className="relative z-[70] inline-flex items-center justify-center shrink-0">
            {/* Blue halo with orange dots, behind the heart, does NOT scale on hover */}
            <Image
              src="/assets/blue-circle-halo.png"
              alt=""
              aria-hidden
              width={1254}
              height={1254}
              className="absolute z-[70] w-auto h-24 sm:h-28 lg:h-36 max-w-none"
              style={{ top: "74%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
            {/* Only the heart grows on hover, wrapped so the halo stays put.
                Scroll-scale lives on the inner image, so the two compose. */}
            <span className="relative z-[80] inline-flex transition-transform duration-300 ease-out hover:scale-[1.08]">
              <Image
                ref={heartRef}
                src="/assets/sufi-heart-banner.png"
                alt="SamaSangha winged heart"
                width={600}
                height={272}
                priority
                className="w-auto h-12 sm:h-20 lg:h-24"
                style={{ transformOrigin: "center top", willChange: "transform" }}
              />
            </span>
          </span>

          {/* "Sangha", right of the heart */}
          <span
            className="leading-none select-none text-2xl sm:text-4xl lg:text-6xl"
            style={{ fontFamily: "var(--font-sama)", color: "#2c4264", textShadow: "0 1px 12px rgba(247,238,219,0.95)" }}
          >
            Sangha
          </span>
        </Link>
      </div>

      </div>

      {/* ── Nav bar, sticky, elegant text ─────────────────────────── */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "#c3e0ea",
          paddingTop: 6,
          paddingBottom: 6,
        }}
      >
        {/* Desktop */}
        <div
          className="hidden lg:flex items-center justify-center gap-4 px-8"
          style={{ height: 44 }}
        >
          {/* Home, hidden on the homepage */}
          {!isHome && (
            <>
              <Link
                href="/"
                className="font-serif transition-colors duration-200"
                style={{ ...DESKTOP_ITEM }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
              >
                Home
              </Link>
              <NavHeart />
            </>
          )}

          {/* Welcome */}
          <Link
            href="/about/teachers"
            className="font-serif transition-colors duration-200"
            style={{ ...DESKTOP_ITEM }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            {DISCOVER.label}
          </Link>

          <NavHeart />

          {/* Teachings */}
          <Link
            href="/deepen"
            className="font-serif transition-colors duration-200"
            style={{ ...DESKTOP_ITEM }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Teachings
          </Link>

          <NavHeart />

          {/* Music */}
          <Link
            href="/deepen/music/albums"
            className="font-serif transition-colors duration-200"
            style={{ ...DESKTOP_ITEM }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Music
          </Link>

          <NavHeart />

          {/* Retreats */}
          <Link
            href="/events/upcoming"
            className="font-serif transition-colors duration-200"
            style={{ ...DESKTOP_ITEM }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Retreats
          </Link>
        </div>

        {/* Mobile, menu listed inline, no hamburger. Large text and roomy
            tap targets (≥44px) with generous spacing for easy reading/tapping. */}
        <nav className="lg:hidden flex flex-wrap items-center justify-center gap-x-1 gap-y-1 px-4 py-3">
          {!isHome && (
            <>
              <Link href="/" className="font-serif" style={MOBILE_ITEM}>Home</Link>
              <NavHeart />
            </>
          )}
          <Link href="/about/teachers" className="font-serif" style={MOBILE_ITEM}>{DISCOVER.label}</Link>
          <NavHeart />
          <Link href="/deepen" className="font-serif" style={MOBILE_ITEM}>Teachings</Link>
          <NavHeart />
          <Link href="/deepen/music/albums" className="font-serif" style={MOBILE_ITEM}>Music</Link>
          <NavHeart />
          <Link href="/events/upcoming" className="font-serif" style={MOBILE_ITEM}>Retreats</Link>
        </nav>
      </header>

      {/* ── Search overlay (outside header, full-screen) ───────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
