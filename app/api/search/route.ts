import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CATEGORY_LABELS: Record<string, string> = {
  DHARMA_GEM: "Dharma Gem",
  TALK: "Talk",
  DANCE_ARTICLE: "Article",
  DANCE_INTERVIEW: "Interview",
  ORIGINAL_DANCE: "Original Dance",
  RESOURCE: "Resource",
};

function postHref(slug: string, category: string) {
  switch (category) {
    case "DHARMA_GEM":   return `/teachings/dharma-gems/${slug}`;
    case "TALK":         return `/teachings/talks/${slug}`;
    case "DANCE_ARTICLE":return `/teachings/dances/articles/${slug}`;
    case "DANCE_INTERVIEW": return `/teachings/dances/interviews`;
    default:             return `/teachings`;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [posts, events, albums, teachers, videos] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, category: true, excerpt: true },
      take: 6,
    }),
    prisma.event.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, startDate: true },
      take: 4,
      orderBy: { startDate: "asc" },
    }),
    prisma.album.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true },
      take: 4,
    }),
    prisma.teacher.findMany({
      where: {
        published: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
    prisma.musicVideo.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, description: true },
      take: 4,
    }),
  ]);

  const results = [
    ...posts.map((p) => ({
      id: p.id,
      label: p.title,
      sublabel: CATEGORY_LABELS[p.category] ?? p.category,
      href: postHref(p.slug, p.category),
      group: "Teachings",
    })),
    ...videos.map((v) => ({
      id: v.id,
      label: v.title,
      sublabel: "Video",
      href: `/teachings/music/videos`,
      group: "Music & Video",
    })),
    ...albums.map((a) => ({
      id: a.id,
      label: a.title,
      sublabel: "Album",
      href: `/teachings/music/albums/${a.slug}`,
      group: "Music & Video",
    })),
    ...events.map((e) => ({
      id: e.id,
      label: e.title,
      sublabel: new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      href: `/events/${e.slug}`,
      group: "Events",
    })),
    ...teachers.map((t) => ({
      id: t.id,
      label: t.name,
      sublabel: "Teacher",
      href: `/about/teachers/${t.slug}`,
      group: "People",
    })),
  ];

  return NextResponse.json({ results });
}
