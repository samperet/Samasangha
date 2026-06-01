import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      include: { tracks: true },
      orderBy: { title: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminAlbumsPage() {
  const albums = await getAlbums();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Albums & Music</h1>
        <Link href="/admin/albums/new">
          <Button>+ New Album</Button>
        </Link>
      </div>
      {albums.length === 0 ? (
        <p className="text-gray-400">No albums yet.</p>
      ) : (
        <div className="space-y-3">
          {albums.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              {a.coverUrl && <img src={a.coverUrl} alt={a.title} className="w-12 h-12 rounded object-cover" />}
              <div className="flex-1">
                <h3 className="font-semibold text-[#1a2744]">{a.title}</h3>
                <p className="text-gray-400 text-xs">{a.year ?? ""} · {a.tracks.length} tracks · {a.published ? "Published" : "Draft"}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/albums/${a.id}`} className="text-[#1a2744] hover:underline">Edit</Link>
                <DeleteButton id={a.id} endpoint="/api/admin/albums" label="album" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
