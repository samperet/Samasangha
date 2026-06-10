"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, FileText, Music,
  Users, Mail, ImageIcon, LogOut, BookOpen,
} from "lucide-react";

const links = [
  { href: "/admin",             label: "Dashboard",         icon: LayoutDashboard, exact: true },
  { href: "/admin/events",      label: "Events",             icon: Calendar },
  { href: "/admin/posts",       label: "Posts & teachings",  icon: FileText },
  { href: "/admin/albums",      label: "Albums & music",     icon: Music },
  { href: "/admin/teachers",    label: "Teachers",           icon: BookOpen },
  { href: "/admin/media",       label: "Media library",      icon: ImageIcon },
  { href: "/admin/contacts",    label: "Contact inbox",      icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers",        icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 flex flex-col min-h-screen shrink-0"
      style={{
        background: "var(--parch-100)",
        borderRight: "1px solid var(--surface-border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/assets/samasangha-winged-heart.png" alt="" width={22} height={22} className="opacity-70" />
          <div>
            <span className="font-serif text-base block" style={{ color: "var(--ink-900)", lineHeight: 1.1 }}>
              SamaSangha
            </span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--fg3)" }}>
              Admin
            </span>
          </div>
        </Link>
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
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
          style={{ color: "var(--fg3)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-700)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--fg3)")}
        >
          View site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
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
  );
}
