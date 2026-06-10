import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function parseEventData(data: Record<string, unknown>) {
  return {
    title: data.title as string,
    description: data.description as string,
    location: (data.location as string) || null,
    isOnline: Boolean(data.isOnline),
    isRetreat: Boolean(data.isRetreat),
    registerUrl: (data.registerUrl as string) || null,
    flyerUrl: (data.flyerUrl as string) || null,
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    registrationEnabled: Boolean(data.registrationEnabled),
    capacity: data.capacity ? Number(data.capacity) : null,
    priceMin: data.priceMin ? Number(data.priceMin) : null,
    priceMax: data.priceMax ? Number(data.priceMax) : null,
    startDate: new Date(data.startDate as string),
    endDate: data.endDate ? new Date(data.endDate as string) : null,
    registrationDeadline: data.registrationDeadline
      ? new Date(data.registrationDeadline as string)
      : null,
  };
}

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
