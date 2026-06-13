import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, capacity } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  try {
    const room = await prisma.room.update({
      where: { id },
      data: {
        name: name.trim(),
        capacity: capacity ? Number(capacity) : null,
      },
    });
    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: "A room with that name already exists" }, { status: 409 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Registrations keep existing, roomId is set to null via onDelete: SetNull
  await prisma.room.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
