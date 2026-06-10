import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Retreats" };
export const revalidate = 60;

async function getRetreats() {
  try {
    return await prisma.event.findMany({
      where: { published: true, isRetreat: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function RetreatsPage() {
  const retreats = await getRetreats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-2">Retreats</h1>
      <p className="text-stone-500 mb-12">Seasonal retreats with Abraham, Halima, and the SamaSangha community.</p>

      {retreats.length === 0 ? (
        <div className="text-stone-400">
          <p className="italic mb-3">No retreats currently scheduled.</p>
          <Link href="/contact" className="text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors">
            Join the mailing list to be notified →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {retreats.map((event) => (
            <div key={event.id} className="rounded-2xl border border-stone-200 p-7">
              <p className="text-sm font-medium text-stone-500 mb-1">
                {formatDateRange(event.startDate, event.endDate)}
              </p>
              {event.location && (
                <p className="text-sm text-stone-400 mb-3">{event.location}</p>
              )}
              <h2 className="text-2xl font-bold text-stone-800 mb-3">{event.title}</h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-5">{event.description}</p>
              <div className="flex gap-3 flex-wrap">
                {event.registerUrl && (
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
                  >
                    Register
                  </a>
                )}
                {event.flyerUrl && (
                  <a
                    href={event.flyerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-600 text-sm font-medium hover:border-stone-500 transition-colors"
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
