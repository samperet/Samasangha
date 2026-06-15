import { NextRequest, NextResponse } from "next/server";
import type { PostCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CATEGORY_LABELS: Record<string, string> = {
  DHARMA_GEM: "Dharma Gem",
  TALK: "Talk",
  DANCE_ARTICLE: "Article",
  DANCE_INTERVIEW: "Interview",
  ORIGINAL_DANCE: "Original Dance",
  RESOURCE: "Resource",
};

// Only categories with a live public page are surfaced in search.
const SEARCHABLE_CATEGORIES: PostCategory[] = ["TALK", "DANCE_ARTICLE", "DANCE_INTERVIEW"];

function postHref(slug: string, category: string) {
  switch (category) {
    case "TALK":            return `/teachings/talks/${slug}`;
    case "DANCE_ARTICLE":   return `/teachings/dances/articles/${slug}`;
    case "DANCE_INTERVIEW": return `/teachings/dances/interviews`;
    default:                return `/teachings/talks/${slug}`;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [posts, events, albums, teachers, videos, tracks] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        category: { in: SEARCHABLE_CATEGORIES },
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
      select: { id: true, title: true, slug: true, description: true, youtubeUrl: true },
      take: 4,
    }),
    prisma.track.findMany({
      where: {
        title: { contains: q, mode: "insensitive" },
        album: { published: true },
      },
      select: {
        id: true,
        title: true,
        album: { select: { slug: true, title: true } },
      },
      take: 8,
      orderBy: { order: "asc" },
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
      href: v.youtubeUrl ?? "/teachings?type=videos",
      group: "Teachings",
    })),
    ...albums.map((a) => ({
      id: a.id,
      label: a.title,
      sublabel: "Album",
      href: `/teachings/music/albums/${a.slug}`,
      group: "Music & Video",
    })),
    ...tracks.map((t) => ({
      id: t.id,
      label: t.title,
      sublabel: `Song · ${t.album.title}`,
      href: `/teachings/music/albums/${t.album.slug}`,
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
