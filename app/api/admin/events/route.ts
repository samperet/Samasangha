import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { EventDataError, parseEventData } from "@/lib/parse-event";

// Event slugs are unique, so two events with the same (or similarly punctuated)
// title would collide. Fall back to "event" when a title slugifies to nothing
// (e.g. it's written in a non-Latin script), then add -2, -3 … until it's free.
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "event";
  for (let n = 1; n < 200; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now()}`;
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
  try {
    const data = await req.json();
    const parsed = parseEventData(data);
    const slug = await uniqueSlug(parsed.title);
    const event = await prisma.event.create({ data: { ...parsed, slug } });
    return NextResponse.json(event);
  } catch (e) {
    if (e instanceof EventDataError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Event create failed:", e);
    return NextResponse.json(
      { error: "The event couldn't be saved. Please try again." },
      { status: 500 }
    );
  }
}
