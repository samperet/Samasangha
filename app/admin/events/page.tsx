import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

async function getEvents() {
  try {
    return await prisma.event.findMany({ orderBy: { startDate: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Events</h1>
        <Link href="/admin/events/new">
          <Button>+ New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400">No events yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#1a2744]">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateShort(e.startDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {e.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/events/${e.id}`} className="text-[#1a2744] hover:underline text-xs">Edit</Link>
                    <DeleteButton id={e.id} endpoint="/api/admin/events" label="event" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
