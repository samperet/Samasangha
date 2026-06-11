import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    include: { room: true },
  });

  if (format === "csv") {
    const rows = [
      ["Name", "Email", "Phone", "Dietary", "Notes", "Status", "Room", "Checked In", "Registered At"].join(","),
      ...regs.map((r) =>
        [
          `"${r.name}"`,
          `"${r.email}"`,
          `"${r.phone ?? ""}"`,
          `"${r.dietary ?? ""}"`,
          `"${(r.notes ?? "").replace(/"/g, '""')}"`,
          r.status,
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
