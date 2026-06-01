import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
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
      <h1 className="text-4xl font-bold text-[#1a2744] mb-2">Upcoming Events</h1>
      <p className="text-gray-500 mb-10">Join us for practices, teachings, and retreats.</p>

      {events.length === 0 ? (
        <p className="text-gray-400 italic">No upcoming events at this time. Check back soon.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg overflow-hidden flex flex-col md:flex-row">
              {event.flyerUrl && (
                <img src={event.flyerUrl} alt={event.title} className="w-full md:w-48 h-48 object-cover" />
              )}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[#c9a84c] text-sm font-medium mb-1">
                      {formatDate(event.startDate)}
                      {event.endDate && ` – ${formatDate(event.endDate)}`}
                    </p>
                    <h2 className="text-xl font-bold text-[#1a2744]">{event.title}</h2>
                    {event.location && <p className="text-gray-500 text-sm mt-1">{event.location}</p>}
                    {event.isOnline && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">Online</span>}
                    {event.isRetreat && <span className="text-xs bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-0.5 rounded mt-1 inline-block ml-1">Retreat</span>}
                  </div>
                  {event.registerUrl && (
                    <a
                      href={event.registerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b8973b] text-white text-sm rounded whitespace-nowrap"
                    >
                      Register
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mt-3 text-sm leading-relaxed line-clamp-3">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
