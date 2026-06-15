import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

async function getProfiles() {
  try {
    return await prisma.mureedProfile.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminMureedsPage() {
  const profiles = await getProfiles();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Sangha Connections</h1>
        <Link href="/admin/mureeds/new">
          <Button>+ Add mureed</Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Listings shown in the Mureeds Circle directory. Members can add themselves there;
        you can edit or remove any listing here.
      </p>

      {profiles.length === 0 ? (
        <p className="text-gray-400">No listings yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1a2744]">
                      <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {p.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.location}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${p.email}`} className="text-[#8f2a23] hover:underline">{p.email}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link href={`/admin/mureeds/${p.id}`} className="text-[#1a2744] hover:underline text-xs">Edit</Link>
                      <DeleteButton id={p.id} endpoint="/api/admin/mureeds" label="listing" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
