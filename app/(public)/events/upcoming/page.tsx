import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Upcoming Events" };
export const revalidate = 60;

async function getEvents() {
  try {
    return await prisma.event.findMany({
      where: { published: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function UpcomingEventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-2">Upcoming Events</h1>
      <p className="text-stone-500 mb-12">Practices, retreats, and gatherings open to all.</p>

      {events.length === 0 ? (
        <div className="text-stone-400 italic">
          <p>No upcoming events scheduled.</p>
          <Link href="/contact" className="text-stone-500 hover:text-stone-800 underline underline-offset-2 mt-2 inline-block transition-colors">
            Join the mailing list to be notified →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative rounded-2xl border border-stone-200 bg-white px-7 py-6 flex flex-col sm:flex-row sm:items-start gap-5"
            >
              {event.isRetreat && (
                <span className="absolute top-5 right-6 text-xs font-semibold uppercase tracking-widest text-stone-400">
                  Retreat
                </span>
              )}
              <div className="sm:w-44 shrink-0">
                <p className="text-sm font-medium text-stone-500 leading-snug">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                {(event.location || event.isOnline) && (
                  <p className="text-sm text-stone-400 mt-1">
                    {event.isOnline ? "Online" : event.location}
                  </p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-stone-800 pr-16 leading-snug mb-2">
                  <Link href={`/events/${event.slug}`} className="hover:underline" style={{ color: "var(--ink-900)" }}>
                    {event.title}
                  </Link>
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 sm:pt-0.5">
                {event.registrationEnabled ? (
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200"
                    style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
                  >
                    Register
                  </Link>
                ) : event.registerUrl ? (
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                    style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
                  >
                    Register
                  </a>
                ) : null}
                {event.flyerUrl && (
                  <a
                    href={event.flyerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-400 hover:text-stone-700 underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    View flyer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
