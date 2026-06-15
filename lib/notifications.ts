import type { NotificationPage } from "@prisma/client";

/** Human-readable labels for each page a notification can target. */
export const NOTIFICATION_PAGES: { value: NotificationPage; label: string; path: string }[] = [
  { value: "HOMEPAGE", label: "Homepage", path: "/" },
  { value: "TUESDAY", label: "Tuesday classes", path: "/deepen/tuesday-practice" },
  { value: "DANCES", label: "Dances of Universal Peace", path: "/dances" },
  { value: "MUREEDS", label: "Mureeds Circle", path: "/mureeds-circle" },
];

export const NOTIFICATION_PAGE_LABELS: Record<NotificationPage, string> = Object.fromEntries(
  NOTIFICATION_PAGES.map((p) => [p.value, p.label]),
) as Record<NotificationPage, string>;
