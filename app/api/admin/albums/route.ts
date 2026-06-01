import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const albums = await prisma.album.findMany({
    include: { tracks: { orderBy: { order: "asc" } } },
    orderBy: { title: "asc" },
  });
  return NextResponse.json(albums);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const { tracks, ...albumData } = data;
  const slug = albumData.slug || slugify(albumData.title);
  const album = await prisma.album.create({
    data: {
      ...albumData,
      slug,
      tracks: tracks ? { create: tracks } : undefined,
    },
    include: { tracks: true },
  });
  return NextResponse.json(album);
}
