import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { parseEventData } from "@/lib/parse-event";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: { _count: { select: { registrations: true } } },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const slug = slugify(data.title as string);
  const event = await prisma.event.create({ data: { ...parseEventData(data), slug } });
  return NextResponse.json(event);
}
