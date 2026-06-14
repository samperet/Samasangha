"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import type { NotificationPage } from "@prisma/client";
import { NOTIFICATION_PAGES } from "@/lib/notifications";

type Notification = { id: string; message: string };

const STORAGE_KEY = "samasangha-dismissed-notifications";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Which notification page (if any) the current path maps to. */
function pageForPath(pathname: string): NotificationPage | null {
  return NOTIFICATION_PAGES.find((p) => p.path === pathname)?.value ?? null;
}

export default function NotificationBanner() {
  const pathname = usePathname();
  const page = pageForPath(pathname);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!page) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/notifications?page=${page}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Notification[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const dismissed = getDismissed();
        setNotifications(data.filter((n) => !dismissed.includes(n.id)));
        setMounted(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page]);

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const dismissed = getDismissed();
      if (!dismissed.includes(id)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id]));
      }
    } catch {}
  }

  if (!page || notifications.length === 0) return null;

  return (
    <div
      className="w-full"
      style={{
        background: "linear-gradient(180deg, var(--parch-100) 0%, var(--parch-50) 100%)",
        borderBottom: "1px solid var(--surface-border)",
        boxShadow: "0 6px 16px -12px rgba(61, 53, 39, 0.4)",
        transition: "opacity 450ms ease, transform 450ms ease",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-10px)",
      }}
      role="region"
      aria-label="Announcements"
    >
      <div
        className="max-w-3xl mx-auto px-10 sm:px-12 divide-y"
        style={{ borderColor: "var(--surface-border)" }}
      >
        {notifications.map((n) => (
          <div key={n.id} className="relative py-5 sm:py-6 flex flex-col items-center gap-2.5 text-center">
            {/* Rose flourish embellishment */}
            <Image
              src="/assets/decorative-line.png"
              alt=""
              aria-hidden
              width={400}
              height={44}
              className="h-5 sm:h-6 w-auto"
            />
            <p
              className="font-serif text-[15px] sm:text-lg leading-relaxed whitespace-pre-line max-w-prose"
              style={{ color: "var(--ink-800)" }}
            >
              {n.message}
            </p>
            <button
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss announcement"
              className="absolute top-3 right-0 p-1.5 rounded-full transition-colors"
              style={{ color: "var(--fg3)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--crimson-700)";
                (e.currentTarget as HTMLElement).style.background = "var(--parch-200)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--fg3)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
