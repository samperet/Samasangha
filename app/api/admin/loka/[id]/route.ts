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
  const body = await req.json();
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const rec = await prisma.lokaRecording.update({
    where: { id },
    data: { approved: body.approved },
  });
  return NextResponse.json(rec);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.lokaRecording.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
