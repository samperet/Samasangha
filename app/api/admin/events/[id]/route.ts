import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const event = await prisma.event.update({ where: { id }, data: parseEventData(data) });
  return NextResponse.json(event);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
