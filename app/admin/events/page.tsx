import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

async function getEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { registrations: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminEventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => e.startDate >= new Date());
  const past = events.filter((e) => e.startDate < new Date());

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Events</h1>
        <Link href="/admin/events/new">
          <Button>+ New event</Button>
        </Link>
      </div>

      {events.length === 0 && (
        <p className="text-gray-400">No events yet. Create one above.</p>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Upcoming</h2>
          <EventTable events={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Past</h2>
          <EventTable events={past} muted />
        </section>
      )}
    </>
  );
}

function EventTable({
  events,
  muted = false,
}: {
  events: Awaited<ReturnType<typeof getEvents>>;
  muted?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${muted ? "opacity-70" : ""}`}>
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Registrations</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-[#1a2744]">{e.title}</div>
                {e.isRetreat && (
                  <span className="text-xs text-amber-600">Retreat</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateShort(e.startDate)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  e.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {e.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                {e.registrationEnabled ? (
                  <Link
                    href={`/admin/events/${e.id}/registrations`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a2744] hover:underline"
                  >
                    <span className="text-base font-bold">{e._count.registrations}</span>
                    <span className="text-gray-400">registrations</span>
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">,</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/events/${e.id}`} className="text-xs text-[#1a2744] hover:underline">
                    Edit
                  </Link>
                  {e.registrationEnabled && (
                    <Link href={`/admin/events/${e.id}/registrations`} className="text-xs text-gray-500 hover:underline">
                      Registrations
                    </Link>
                  )}
                  <Link href={`/events/${e.slug}`} target="_blank" className="text-xs text-gray-400 hover:underline">
                    View ↗
                  </Link>
                  <DeleteButton id={e.id} endpoint="/api/admin/events" label="event" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
