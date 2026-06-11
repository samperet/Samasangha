import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.room.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { registrations: true } } },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, capacity } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  const last = await prisma.room.findFirst({ orderBy: { order: "desc" } });
  try {
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        capacity: capacity ? Number(capacity) : null,
        order: (last?.order ?? 0) + 1,
      },
    });
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A room with that name already exists" }, { status: 409 });
  }
}
