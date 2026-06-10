import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import RegistrationActions from "./RegistrationActions";

async function getData(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "asc" } },
      _count: { select: { registrations: true } },
    },
  });
  return event;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-800",
  CONFIRMED:  "bg-green-100 text-green-800",
  WAITLISTED: "bg-blue-100 text-blue-700",
  CANCELLED:  "bg-gray-100 text-gray-500",
};

export default async function RegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getData(id).catch(() => null);
  if (!event) notFound();

  const counts = {
    total: event.registrations.length,
    confirmed: event.registrations.filter((r) => r.status === "CONFIRMED").length,
    pending: event.registrations.filter((r) => r.status === "PENDING").length,
    waitlisted: event.registrations.filter((r) => r.status === "WAITLISTED").length,
    cancelled: event.registrations.filter((r) => r.status === "CANCELLED").length,
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <Link href={`/admin/events/${id}`} className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">
            ← Back to event
          </Link>
          <h1 className="text-2xl font-bold text-[#1a2744]">Registrations</h1>
          <p className="text-gray-500 text-sm mt-0.5">{event.title}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/events/${id}/registrations?format=csv`}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </a>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View public page ↗
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total", value: counts.total, color: "text-gray-800" },
          { label: "Confirmed", value: counts.confirmed, color: "text-green-700" },
          { label: "Pending", value: counts.pending, color: "text-amber-700" },
          { label: "Waitlisted", value: counts.waitlisted, color: "text-blue-700" },
          { label: "Cancelled", value: counts.cancelled, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      {event.capacity && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl px-5 py-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Capacity</span>
            <span className="text-gray-500">
              {counts.confirmed + counts.pending} / {event.capacity} filled
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c4922b] rounded-full transition-all"
              style={{ width: `${Math.min(100, ((counts.confirmed + counts.pending) / event.capacity) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {event.registrations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400">No registrations yet.</p>
          {event.registrationEnabled ? (
            <p className="text-sm text-gray-400 mt-2">
              Share the{" "}
              <Link href={`/events/${event.slug}/register`} target="_blank" className="text-[#8f2a23] hover:underline">
                registration link
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-2">
              <Link href={`/admin/events/${id}`} className="text-[#8f2a23] hover:underline">
                Enable built-in registration
              </Link>{" "}
              on the event to collect registrations here.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Notes</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Registered</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {event.registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{reg.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${reg.email}`} className="text-[#8f2a23] hover:underline">
                      {reg.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{reg.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-xs">
                    <span className="line-clamp-1 block">
                      {[reg.dietary, reg.notes].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(reg.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[reg.status]}`}>
                      {reg.status.charAt(0) + reg.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RegistrationActions id={reg.id} currentStatus={reg.status} />
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
