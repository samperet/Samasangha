"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X, Search } from "lucide-react";
import dynamic from "next/dynamic";

const SearchOverlay = dynamic(() => import("./SearchOverlay"), { ssr: false });

// ── Content ────────────────────────────────────────────────────────────────

const DISCOVER = {
  label: "Welcome",
  context: "Learn about the path and the lineage",
  sections: [
    {
      heading: "The community",
      links: [
        { label: "Who we are & our teachers", href: "/about" },
      ],
    },
    {
      heading: "The lineage",
      links: [
        { label: "Hazrat Inayat Khan", href: "/about/teachers/hazrat-inayat-khan" },
        { label: "Murshid Samuel Lewis", href: "/about/teachers/murshid-samuel-lewis" },
        { label: "Pir Moineddin Jablonski", href: "/about/teachers/pir-moineddin-jablonski" },
        { label: "Pir Shabda Kahn", href: "/about/teachers/pir-shabda-kahn" },
        { label: "All teachers →", href: "/about/teachers" },
      ],
    },
    {
      heading: "Come gather",
      links: [
        { label: "Upcoming events", href: "/events/upcoming" },
        { label: "Retreats", href: "/events/retreats" },
        { label: "Tuesday practice", href: "/teachings/tuesday-practice" },
      ],
    },
  ],
} as const;

const DEEPEN = {
  label: "Deepen",
  context: "Teachings, music and dances",
  sections: [
    {
      heading: "Teachings",
      links: [
        { label: "Dharma gems", href: "https://www.youtube.com/playlist?list=PLzy2sDRtoSh-5GiHJ2E3biLDBhOXDcprd" },
        { label: "Talks & recordings", href: "/teachings/talks" },
        { label: "Mureeds' deepening", href: "/teachings/deepening" },
      ],
    },
    {
      heading: "Music",
      links: [
        { label: "Videos on YouTube", href: "https://www.youtube.com/@samasangha1733/videos" },
      ],
    },
    {
      heading: "Dances",
      links: [
        { label: "Articles", href: "/teachings/dances/articles" },
        { label: "Interviews", href: "/teachings/dances/interviews" },
      ],
    },
  ],
} as const;

type MenuKey = "deepen" | null;
type MenuDef = typeof DEEPEN;

// ── Mega panel ─────────────────────────────────────────────────────────────

function MegaPanel({ menu, onClose }: { menu: MenuDef; onClose: () => void }) {
  return (
    <div
      data-mega-panel
      className="absolute left-0 right-0 z-40"
      style={{
        top: "100%",
        background: "var(--parch-50)",
        borderTop: "2px solid var(--gold-400)",
        borderBottom: "1px solid var(--surface-border)",
        boxShadow: "0 20px 60px rgba(42,33,24,.18)",
      }}
    >
      <div
        className="max-w-5xl mx-auto px-8 py-9"
        style={{ display: "grid", gridTemplateColumns: `200px repeat(${menu.sections.length}, 1fr)`, gap: "3rem", alignItems: "start" }}
      >
        {/* Dharma Gems feature graphic */}
        <Link href="https://www.youtube.com/playlist?list=PLzy2sDRtoSh-5GiHJ2E3biLDBhOXDcprd" onClick={onClose} target="_blank" rel="noopener noreferrer">
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
            <Image
              src="/assets/Dharma-Gems.png"
              alt="Dharma Gems"
              width={200}
              height={160}
              className="w-full object-cover"
              style={{ display: "block" }}
            />
          </div>
          <p className="eyebrow mt-2" style={{ fontSize: "0.65rem", color: "var(--gold-600)" }}>Dharma Gems</p>
        </Link>

        {menu.sections.map((section) => (
          <div key={section.heading}>
            <p className="eyebrow mb-5" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>
              {section.heading}
            </p>
            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-serif block transition-colors duration-150"
                    style={{ fontSize: "1.15rem", fontWeight: 400, color: "var(--ink-800)" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "var(--crimson-700)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "var(--ink-800)";
                    }}
                  >
                    {link.label}{link.href.startsWith("http") && <span style={{ fontSize: "0.75rem", opacity: 0.45, marginLeft: "0.3em" }}>↗</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile accordion ───────────────────────────────────────────────────────

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [deepenOpen, setDeepenOpen] = useState(false);

  return (
    <div style={{ background: "#1a1208", borderTop: "1px solid rgba(201,162,44,.14)" }}>
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

      {/* Deepen — accordion */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <button
          className="w-full flex items-center justify-between px-6 py-4 text-left"
          onClick={() => setDeepenOpen(!deepenOpen)}
        >
          <div>
            <span className="font-serif text-base block" style={{ color: "var(--gold-300)" }}>
              {DEEPEN.label}
            </span>
            <span className="text-xs block mt-0.5" style={{ color: "var(--fg-on-dark)", opacity: 0.35 }}>
              {DEEPEN.context}
            </span>
          </div>
          <span style={{ color: "var(--gold-600)" }}>{deepenOpen ? "−" : "+"}</span>
        </button>
        {deepenOpen && (
          <div className="px-6 pb-5 space-y-5">
            {DEEPEN.sections.map((s) => (
              <div key={s.heading}>
                <p className="eyebrow mb-2" style={{ fontSize: "0.68rem", color: "var(--gold-600)" }}>
                  {s.heading}
                </p>
                <ul className="space-y-2">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={onClose} className="text-sm block" style={{ color: "var(--fg-on-dark)", opacity: 0.62 }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Music — plain link */}
      <div style={{ borderBottom: "1px solid rgba(201,162,44,.08)" }}>
        <Link
          href="/teachings/music"
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
  const [active, setActive] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);


  // ── Dismissal: close on click outside the header
  useEffect(() => {
    if (!active) return;
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [active]);

  // Open search with Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setActive(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = useCallback(() => setActive(null), []);
  const activeMenu = active === "deepen" ? DEEPEN : null;

  return (
    <>
      {/* ── Nav bar — very top, always visible, elegant text only ──── */}
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
            onClick={closeMenu}
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
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
            onClick={closeMenu}
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            {DISCOVER.label}
          </Link>

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Deepen */}
          {(() => {
            const isActive = active === "deepen";
            return (
              <button
                onClick={() => setActive(isActive ? null : "deepen")}
                className="font-serif transition-colors duration-200"
                style={{ fontSize: "1.2rem", fontWeight: 700, color: isActive ? "var(--crimson-700)" : "var(--ink-800)", background: "none", border: "none", outline: "none", cursor: "default", letterSpacing: "0.01em", padding: 0 }}
              >
                {DEEPEN.label}
              </button>
            );
          })()}

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Music */}
          <Link
            href="/teachings/music"
            onClick={closeMenu}
            className="font-serif transition-colors duration-200"
            style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--crimson-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-800)")}
          >
            Music
          </Link>

          {/* Gold dot separator */}
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.6, flexShrink: 0 }} />

          {/* Search */}
          <button
            onClick={() => { setSearchOpen(true); setActive(null); }}
            className="flex items-center gap-1.5 transition-opacity duration-200"
            style={{ background: "none", border: "none", outline: "none", cursor: "default", opacity: 0.5, padding: 0 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.5")}
            aria-label="Search ⌘K"
          >
            <Search size={15} style={{ color: "var(--ink-700)" }} />
            <span style={{ fontSize: "0.9rem", color: "var(--ink-700)", fontFamily: "var(--font-sans)" }}>Search</span>
          </button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-between px-5" style={{ height: 44 }}>
          <Link href="/" onClick={closeMenu} className="font-serif" style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ink-800)" }}>
            Sama Sangha
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} style={{ color: "var(--ink-700)", opacity: 0.55, background: "none", border: "none" }} aria-label="Search">
              <Search size={18} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "var(--ink-700)", opacity: 0.7, background: "none", border: "none" }} aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mega panel */}
        {activeMenu && <MegaPanel menu={activeMenu} onClose={closeMenu} />}

        {/* Mobile menu */}
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </header>

      {/* ── Search overlay (outside header, full-screen) ───────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
