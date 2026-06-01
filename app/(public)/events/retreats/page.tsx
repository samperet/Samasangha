import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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
      <h1 className="text-4xl font-bold text-[#1a2744] mb-2">Retreats</h1>
      <p className="text-gray-500 mb-10">
        Deepen your practice with our seasonal retreats.
      </p>
      {retreats.length === 0 ? (
        <p className="text-gray-400 italic">No retreats scheduled at this time.</p>
      ) : (
        <div className="space-y-6">
          {retreats.map((r) => (
            <div key={r.id} className="border rounded-lg p-6">
              <p className="text-[#c9a84c] text-sm font-medium mb-1">
                {formatDate(r.startDate)}
                {r.endDate && ` – ${formatDate(r.endDate)}`}
              </p>
              <h2 className="text-xl font-bold text-[#1a2744] mb-2">{r.title}</h2>
              {r.location && <p className="text-gray-500 text-sm mb-3">{r.location}</p>}
              <p className="text-gray-600 text-sm">{r.description}</p>
              {r.registerUrl && (
                <a
                  href={r.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8973b] text-white text-sm rounded"
                >
                  Register
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
