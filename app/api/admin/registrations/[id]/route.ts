import { NextRequest, NextResponse } from "next/server";
import { Prisma, RegistrationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = Object.values(RegistrationStatus);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data: Prisma.EventRegistrationUncheckedUpdateInput = {};

  if ("status" in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if ("checkedIn" in body) {
    data.checkedIn = Boolean(body.checkedIn);
  }
  if ("roomId" in body) {
    data.roomId = body.roomId || null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const reg = await prisma.eventRegistration.update({
    where: { id },
    data,
  });
  return NextResponse.json(reg);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.eventRegistration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
