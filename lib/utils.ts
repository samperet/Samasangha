import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "May 29 – 31, 2026" or "July 30 – August 2, 2026"
// Dates are date-only (stored at UTC midnight), so read in UTC to avoid
// an off-by-one when rendered in a timezone behind UTC.
export function formatDateRange(start: Date | string, end?: Date | string | null): string {
  const s = new Date(start);
  const startMonth = s.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const startDay = s.getUTCDate();
  const year = s.getUTCFullYear();

  if (!end) {
    return `${startMonth} ${startDay}, ${year}`;
  }

  const e = new Date(end);
  const endMonth = e.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const endDay = e.getUTCDate();

  if (startMonth === endMonth && s.getUTCFullYear() === e.getUTCFullYear()) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}
