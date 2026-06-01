"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "Teachers", href: "/about/teachers" },
      { label: "Lineage", href: "/about/lineage" },
    ],
  },
  {
    label: "Teachings",
    href: "/teachings",
    children: [
      { label: "Dharma Gems", href: "/teachings/dharma-gems" },
      { label: "Tuesday Practice", href: "/teachings/tuesday-practice" },
      { label: "Talks", href: "/teachings/talks" },
      { label: "Deepening", href: "/teachings/deepening" },
      { label: "Dances of Universal Peace", href: "/teachings/dances" },
      { label: "Music", href: "/teachings/music" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming", href: "/events/upcoming" },
      { label: "Retreats", href: "/events/retreats" },
      { label: "Past Events", href: "/events/past" },
    ],
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "Photos", href: "/community/photos" },
      { label: "Resources", href: "/community/resources" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="bg-[#1a2744] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-[#c9a84c] font-bold text-xl tracking-wide">
            SamaSangha
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) =>
            item.children ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm rounded hover:text-[#c9a84c] transition-colors"
                >
                  {item.label}
                </Link>
                {activeDropdown === item.href && (
                  <div className="absolute top-full left-0 bg-[#1a2744] border border-[#c9a84c]/20 rounded shadow-lg min-w-48 py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm rounded hover:text-[#c9a84c] transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden bg-[#1a2744] border-t border-[#c9a84c]/20 px-4 pb-4">
          {nav.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="block py-2 font-medium hover:text-[#c9a84c]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block py-1.5 pl-4 text-sm text-white/70 hover:text-[#c9a84c]"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
