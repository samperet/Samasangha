import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Past Events" };
export const revalidate = 300;

async function getPastEvents() {
  try {
    return await prisma.event.findMany({
      where: { published: true, startDate: { lt: new Date() } },
      orderBy: { startDate: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}

export default async function PastEventsPage() {
  const events = await getPastEvents();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Past Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-400 italic">No past events recorded yet.</p>
      ) : (
        <div className="divide-y">
          {events.map((e) => (
            <div key={e.id} className="py-4">
              <p className="text-[#c9a84c] text-xs font-medium uppercase tracking-wide">
                {formatDate(e.startDate)}
              </p>
              <h3 className="font-semibold text-[#1a2744]">{e.title}</h3>
              {e.location && <p className="text-sm text-gray-400">{e.location}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
