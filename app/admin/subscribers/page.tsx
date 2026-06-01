import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getSubscribers() {
  try {
    return await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers();
  const active = subscribers.filter((s) => s.active).length;

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Mailing List</h1>
      <p className="text-gray-500 mb-6">{active} active subscriber{active !== 1 ? "s" : ""}</p>

      {subscribers.length === 0 ? (
        <p className="text-gray-400">No subscribers yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {s.active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
