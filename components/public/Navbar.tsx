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

// Mobile menu item — large text + roomy padding so the tap target clears the
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
        router.push(clicks >= 3 ? "/admin" : "/");
      }, 350);
    },
    [router]
  );

  // ── Heart gently shrinks as the page scrolls down (imperative, no re-render)
  // Only the heart scales — the blue halo behind it stays put.
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
      {/* ── Winged heart banner — scrolls away with the page ───────── */}
      <div
        className="flex justify-center pt-6 pb-3 px-5"
        style={{ background: "var(--parch-50)" }}
      >
        <Link
          href="/"
          aria-label="SamaSangha home"
          className="relative inline-flex items-center justify-center gap-2 sm:gap-4 lg:gap-5"
          onClick={onHeartClick}
        >
          {/* "Sama" — left of the heart. The left padding equals the width
              difference vs. "Sangha" (in em, so it scales with the font), which
              balances the two sides and centers the heart on the page. */}
          <span
            className="leading-none select-none text-2xl sm:text-4xl lg:text-6xl"
            style={{ fontFamily: "var(--font-sama)", color: "#2c4264", paddingLeft: "1.115em" }}
          >
            Sama
          </span>

          {/* Heart + halo, kept as a centered unit. Lifted above the sticky
              header (z-50) so the halo's bottom isn't clipped by the menu bar. */}
          <span className="relative z-[60] inline-flex items-center justify-center shrink-0">
            {/* Blue halo with orange dots, behind the heart — does NOT scale on hover */}
            <Image
              src="/assets/blue-circle-halo.png"
              alt=""
              aria-hidden
              width={1254}
              height={1254}
              className="absolute w-auto h-24 sm:h-28 lg:h-36 max-w-none"
              style={{ top: "74%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
            {/* Only the heart grows on hover — wrapped so the halo stays put.
                Scroll-scale lives on the inner image, so the two compose. */}
            <span className="relative inline-flex transition-transform duration-300 ease-out hover:scale-[1.08]">
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

          {/* "Sangha" — right of the heart */}
          <span
            className="leading-none select-none text-2xl sm:text-4xl lg:text-6xl"
            style={{ fontFamily: "var(--font-sama)", color: "#2c4264" }}
          >
            Sangha
          </span>
        </Link>
      </div>

      {/* ── Decorative flourish (flipped) — on top of the menu, not sticky ── */}
      <div
        className="hidden lg:flex justify-center px-5"
        style={{ background: "var(--parch-50)", paddingTop: 18, paddingBottom: 6 }}
      >
        <Image
          src="/assets/decorative-line.png"
          alt=""
          aria-hidden
          width={400}
          height={44}
          className="h-6 w-auto"
          style={{ transform: "scaleY(-1)" }}
        />
      </div>

      {/* ── Nav bar — sticky, elegant text ─────────────────────────── */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50"
        style={{ background: "var(--parch-50)", borderBottom: "1px solid var(--surface-border)" }}
      >
        {/* Desktop */}
        <div
          className="hidden lg:flex items-center justify-center gap-8 px-8"
          style={{ height: 44 }}
        >
          {/* Home — hidden on the homepage */}
          {!isHome && (
            <>
              <Link
                href="/"
                className="font-serif transition-colors duration-200"
                style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
              >
                Home
              </Link>

              {/* Gold dot separator */}
              <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />
            </>
          )}

          {/* Welcome */}
          <Link
            href="/about/teachers"
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            {DISCOVER.label}
          </Link>

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Teachings */}
          <Link
            href="/teachings"
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Teachings
          </Link>

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Music */}
          <Link
            href="/teachings/music/albums"
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Music
          </Link>

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Search — same style as the other menu items */}
          <button
            onClick={() => setSearchOpen(true)}
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--ink-800)", background: "none", border: "none", outline: "none", cursor: "default", letterSpacing: "0.01em", padding: 0 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
            aria-label="Search ⌘K"
          >
            Search
          </button>
        </div>

        {/* Mobile — menu listed inline, no hamburger. Large text and roomy
            tap targets (≥44px) with generous spacing for easy reading/tapping. */}
        <nav className="lg:hidden flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3">
          {!isHome && (
            <Link href="/" className="font-serif" style={MOBILE_ITEM}>
              Home
            </Link>
          )}
          <Link href="/about/teachers" className="font-serif" style={MOBILE_ITEM}>
            {DISCOVER.label}
          </Link>
          <Link href="/teachings" className="font-serif" style={MOBILE_ITEM}>
            Teachings
          </Link>
          <Link href="/teachings/music/albums" className="font-serif" style={MOBILE_ITEM}>
            Music
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="font-serif"
            style={{ ...MOBILE_ITEM, background: "none", border: "none", cursor: "pointer" }}
            aria-label="Search"
          >
            Search
          </button>
        </nav>
      </header>

      {/* ── Search overlay (outside header, full-screen) ───────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
