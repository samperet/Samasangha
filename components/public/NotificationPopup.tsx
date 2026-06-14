"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { NotificationPage } from "@prisma/client";

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

export default function NotificationPopup({ page }: { page: NotificationPage }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/notifications?page=${page}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Notification[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const dismissed = getDismissed();
        setNotifications(data.filter((n) => !dismissed.includes(n.id)));
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

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm flex flex-col gap-3"
      role="region"
      aria-label="Announcements"
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className="relative rounded-xl px-5 py-4 pr-10 text-sm"
          style={{
            background: "var(--lapis-700, #1a2744)",
            color: "var(--fg-on-dark, #fff)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          }}
        >
          <p className="leading-relaxed whitespace-pre-line">{n.message}</p>
          <button
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss notification"
            className="absolute top-2.5 right-2.5 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "var(--fg-on-dark, #fff)" }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
