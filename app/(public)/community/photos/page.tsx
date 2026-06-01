import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Community Photos" };
export const revalidate = 300;

async function getPhotos() {
  try {
    return await prisma.media.findMany({
      where: { mimeType: { startsWith: "image/" }, postId: null },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
  } catch {
    return [];
  }
}

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Community Photos</h1>
      {photos.length === 0 ? (
        <p className="text-gray-400 italic">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
              <img
                src={p.url}
                alt={p.alt ?? p.filename}
                className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
