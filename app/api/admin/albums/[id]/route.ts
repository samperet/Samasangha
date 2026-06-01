import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: { tracks: { orderBy: { order: "asc" } } },
  });
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(album);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { tracks, ...data } = await req.json();
  await prisma.track.deleteMany({ where: { albumId: id } });
  const album = await prisma.album.update({
    where: { id },
    data: {
      ...data,
      tracks: tracks ? { create: tracks } : undefined,
    },
    include: { tracks: true },
  });
  return NextResponse.json(album);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.album.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
