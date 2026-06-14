import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";
import { NOTIFICATION_PAGE_LABELS } from "@/lib/notifications";

async function getNotifications() {
  try {
    return await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

function statusOf(n: Awaited<ReturnType<typeof getNotifications>>[number]) {
  if (!n.enabled) return { label: "Disabled", className: "bg-gray-100 text-gray-500" };
  const now = new Date();
  if (n.startTime && n.startTime > now) return { label: "Scheduled", className: "bg-blue-100 text-blue-700" };
  if (n.finishTime && n.finishTime < now) return { label: "Expired", className: "bg-gray-100 text-gray-500" };
  return { label: "Active", className: "bg-green-100 text-green-700" };
}

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Notifications</h1>
        <Link href="/admin/notifications/new">
          <Button>+ New notification</Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Dismissible pop-ups shown to visitors on a selected page, within an optional time window.
      </p>

      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications yet. Create one above.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Page</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Window</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const status = statusOf(n);
                  return (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[#1a2744] max-w-xs">
                        <span className="line-clamp-2 block">{n.message}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {NOTIFICATION_PAGE_LABELS[n.page]}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell whitespace-nowrap">
                        {n.startTime ? formatDate(n.startTime) : "Always"}
                        {" → "}
                        {n.finishTime ? formatDate(n.finishTime) : "∞"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <Link href={`/admin/notifications/${n.id}`} className="text-[#1a2744] hover:underline text-xs">
                          Edit
                        </Link>
                        <DeleteButton id={n.id} endpoint="/api/admin/notifications" label="notification" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
