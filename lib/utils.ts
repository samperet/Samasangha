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
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "May 29 – 31, 2026" or "July 30 – August 2, 2026"
export function formatDateRange(start: Date | string, end?: Date | string | null): string {
  const s = new Date(start);
  const startMonth = s.toLocaleDateString("en-US", { month: "long" });
  const startDay = s.getDate();
  const year = s.getFullYear();

  if (!end) {
    return `${startMonth} ${startDay}, ${year}`;
  }

  const e = new Date(end);
  const endMonth = e.toLocaleDateString("en-US", { month: "long" });
  const endDay = e.getDate();

  if (startMonth === endMonth && s.getFullYear() === e.getFullYear()) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}
