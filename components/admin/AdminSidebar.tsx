"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Music,
  Users,
  Mail,
  Image,
  LogOut,
  BookOpen,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/posts", label: "Posts & Teachings", icon: FileText },
  { href: "/admin/albums", label: "Albums & Music", icon: Music },
  { href: "/admin/teachers", label: "Teachers", icon: BookOpen },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/contacts", label: "Contact Inbox", icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#1a2744] text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="block">
          <span className="font-bold text-[#c9a84c] text-lg">SamaSangha</span>
          <p className="text-white/50 text-xs mt-0.5">Admin Dashboard</p>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                active
                  ? "bg-[#c9a84c]/20 text-[#c9a84c]"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-white/50 hover:text-white transition-colors mb-1"
        >
          View Site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-white/50 hover:text-white transition-colors w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
