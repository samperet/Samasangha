import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Music Videos" };
export const revalidate = 60;

async function getVideos() {
  try {
    return await prisma.musicVideo.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match?.[1] ?? null;
}

export default async function MusicVideosPage() {
  const videos = await getVideos();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-8">Music Videos</h1>
      {videos.length === 0 ? (
        <p className="text-gray-400 italic">No videos published yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((v) => {
            const ytId = v.youtubeUrl ? getYouTubeId(v.youtubeUrl) : null;
            return (
              <div key={v.id}>
                {ytId ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover rounded-lg" />
                ) : null}
                <h3 className="font-bold text-[#1a2744] mt-3">{v.title}</h3>
                {v.description && <p className="text-sm text-gray-500 mt-1">{v.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
