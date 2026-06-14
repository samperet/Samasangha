"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar, FileText, Music, Bell, Users, LogOut, Home, Menu, X, type LucideIcon,
} from "lucide-react";

type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const links: NavLink[] = [
  { href: "/admin/events",        label: "Events",             icon: Calendar },
  { href: "/admin/posts",         label: "Posts & teachings",  icon: FileText },
  { href: "/admin/albums",        label: "Albums & music",     icon: Music },
  { href: "/admin/mureeds",       label: "Mureed directory",   icon: Users },
  { href: "/admin/notifications", label: "Notifications",      icon: Bell },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          background: "var(--parch-100)",
          borderBottom: "1px solid var(--surface-border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/sufi-heart-banner.png" alt="" width={600} height={272} className="w-auto h-7" />
          <span className="font-serif text-base" style={{ color: "var(--ink-900)" }}>
            SamaSangha
          </span>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--fg3)" }}>
            Admin
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-lg"
          style={{ color: "var(--ink-700)" }}
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside
        className={cn(
          "w-56 flex flex-col shrink-0",
          // Mobile: fixed off-canvas drawer
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, always visible
          "md:static md:translate-x-0 md:min-h-screen",
        )}
        style={{
          background: "var(--parch-100)",
          borderRight: "1px solid var(--surface-border)",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--surface-border)" }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/sufi-heart-banner.png" alt="" width={600} height={272} className="w-auto h-8" />
            <div>
              <span className="font-serif text-base block" style={{ color: "var(--ink-900)", lineHeight: 1.1 }}>
                SamaSangha
              </span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--fg3)" }}>
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1 -mr-1 rounded-lg"
            style={{ color: "var(--fg3)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                  active
                    ? "font-medium"
                    : "hover:bg-parch-200"
                )}
                style={
                  active
                    ? { background: "var(--gold-100)", color: "var(--gold-700)" }
                    : { color: "var(--ink-700)" }
                }
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
            style={{ color: "var(--fg3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--fg3)")}
          >
            <Home size={15} />
            Home
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full transition-colors duration-150 text-left"
            style={{ color: "var(--fg3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-700)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--fg3)")}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
