import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AlbumForm from "../AlbumForm";

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let album;
  try {
    album = await prisma.album.findUnique({
      where: { id },
      include: { tracks: { orderBy: { order: "asc" } } },
    });
  } catch {}
  if (!album) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Album</h1>
      <AlbumForm album={album} />
    </>
  );
}
