import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { startDate: "asc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const slug = data.slug || slugify(data.title);
  const event = await prisma.event.create({
    data: { ...data, slug, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
  return NextResponse.json(event);
}
