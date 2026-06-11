"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

const SearchOverlay = dynamic(() => import("./SearchOverlay"), { ssr: false });

// ── Content ────────────────────────────────────────────────────────────────

// "Welcome" is a simple link to the About/Teachers page (no dropdown).
const DISCOVER = {
  label: "Welcome",
  context: "Learn about the path and the lineage",
} as const;

// "Teachings" is a plain link to the filterable teachings list (no dropdown).

// ── Mobile accordion ───────────────────────────────────────────────────────

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ background: "#1a1208", borderTop: "1px solid rgba(201,162,44,.14)" }}>
      {/* Decorative flourish */}
      <div className="flex justify-center pt-3 pb-1">
        <Image src="/assets/decorative-line.png" alt="" aria-hidden width={400} height={44} className="h-5 w-auto" />
      </div>
      {/* Home */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center justify-between px-6 py-4"
        >
          <span className="font-serif text-base block" style={{ color: "var(--gold-300)", fontWeight: 700 }}>
            Home
          </span>
          <span style={{ color: "var(--gold-600)", fontSize: "0.85rem" }}>→</span>
        </Link>
      </div>

      {/* Discover — plain link */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <Link
          href="/about/teachers"
          onClick={onClose}
          className="flex items-center justify-between px-6 py-4"
        >
          <div>
            <span className="font-serif text-base block" style={{ color: "var(--gold-300)" }}>
              {DISCOVER.label}
            </span>
            <span className="text-xs block mt-0.5" style={{ color: "var(--fg-on-dark)", opacity: 0.35 }}>
              {DISCOVER.context}
            </span>
          </div>
          <span style={{ color: "var(--gold-600)", fontSize: "0.85rem" }}>→</span>
        </Link>
      </div>

      {/* Teachings — plain link */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <Link
          href="/teachings"
          onClick={onClose}
          className="flex items-center justify-between px-6 py-4"
        >
          <div>
            <span className="font-serif text-base block" style={{ color: "var(--gold-300)" }}>
              Teachings
            </span>
            <span className="text-xs block mt-0.5" style={{ color: "var(--fg-on-dark)", opacity: 0.35 }}>
              Talks, dharma gems, articles and dances
            </span>
          </div>
          <span style={{ color: "var(--gold-600)", fontSize: "0.85rem" }}>→</span>
        </Link>
      </div>

      {/* Music — plain link */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <Link
          href="/teachings/music/albums"
          onClick={onClose}
          className="flex items-center justify-between px-6 py-4"
        >
          <span className="font-serif text-base block" style={{ color: "var(--gold-300)" }}>
            Music
          </span>
          <span style={{ color: "var(--gold-600)", fontSize: "0.85rem" }}>→</span>
        </Link>
      </div>

      <div className="px-6 py-4 flex gap-5">
        <Link href="/events/upcoming" onClick={onClose} className="text-sm" style={{ color: "var(--gold-400)" }}>Events</Link>
        <Link href="/contact" onClick={onClose} className="text-sm" style={{ color: "var(--fg-on-dark)", opacity: 0.45 }}>Contact</Link>
      </div>
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

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

          {/* Heart + halo, kept as a centered unit */}
          <span className="relative inline-flex items-center justify-center shrink-0">
            {/* Blue halo with orange dots, behind the heart */}
            <Image
              src="/assets/blue-circle-halo.png"
              alt=""
              aria-hidden
              width={1254}
              height={1254}
              className="absolute w-auto h-24 sm:h-28 lg:h-36 max-w-none"
              style={{ top: "74%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
            <Image
              ref={heartRef}
              src="/assets/sufi-heart-banner.png"
              alt="SamaSangha winged heart"
              width={600}
              height={272}
              priority
              className="relative w-auto h-12 sm:h-20 lg:h-24"
              style={{ transformOrigin: "center top", willChange: "transform" }}
            />
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
          {/* Home */}
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

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-end px-5" style={{ height: 44 }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "var(--ink-700)", opacity: 0.7, background: "none", border: "none" }} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </header>

      {/* ── Search overlay (outside header, full-screen) ───────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
