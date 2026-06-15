import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update a booking's payment status (e.g. mark a mailed check as received).
// Paid → the booking and all its participants become CONFIRMED; unpaid reverts
// them to PENDING.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.paymentStatus !== "PAID" && body.paymentStatus !== "UNPAID") {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }
  const paid = body.paymentStatus === "PAID";

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      paymentStatus: body.paymentStatus,
      status: paid ? "CONFIRMED" : "PENDING",
      participants: { updateMany: { where: {}, data: { status: paid ? "CONFIRMED" : "PENDING" } } },
    },
  });
  return NextResponse.json(booking);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
