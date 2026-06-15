import { NextRequest, NextResponse } from "next/server";
import { RegistrationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Manually add a registrant from the admin (walk-ins, phone/email signups)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const status = Object.values(RegistrationStatus).includes(body.status)
    ? (body.status as RegistrationStatus)
    : "CONFIRMED";

  const reg = await prisma.eventRegistration.create({
    data: {
      eventId: id,
      name,
      email,
      phone: (body.phone as string)?.trim() || null,
      dietary: (body.dietary as string)?.trim() || null,
      notes: (body.notes as string)?.trim() || null,
      status,
    },
  });
  return NextResponse.json(reg, { status: 201 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
    include: { room: true, booking: true },
  });

  if (format === "csv") {
    const dollars = (cents: number) => (cents / 100).toFixed(2);
    const rows = [
      ["Name", "Child", "Email", "Phone", "Dietary", "Notes", "Status", "Payment Method", "Payment Status", "Amount", "Room", "Checked In", "Registered At"].join(","),
      ...regs.map((r) =>
        [
          `"${r.name}"`,
          r.isChild ? "Yes" : "No",
          `"${r.email}"`,
          `"${r.phone ?? ""}"`,
          `"${r.dietary ?? ""}"`,
          `"${(r.notes ?? "").replace(/"/g, '""')}"`,
          r.status,
          r.booking?.paymentMethod ?? "",
          r.booking?.paymentStatus ?? "",
          r.booking ? dollars(r.booking.amountCents) : "",
          `"${r.room?.name ?? ""}"`,
          r.checkedIn ? "Yes" : "No",
          r.createdAt.toISOString(),
        ].join(",")
      ),
    ].join("\n");

    return new NextResponse(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations-${id}.csv"`,
      },
    });
  }

  return NextResponse.json(regs);
}
