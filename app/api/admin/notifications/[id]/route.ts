import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NotificationPage } from "@prisma/client";

const VALID_PAGES: NotificationPage[] = ["HOMEPAGE", "TUESDAY", "DANCES"];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(notification);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();

  if (!data.message || typeof data.message !== "string" || !data.message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (!VALID_PAGES.includes(data.page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        message: data.message.trim(),
        page: data.page,
        startTime: data.startTime ? new Date(data.startTime) : null,
        finishTime: data.finishTime ? new Date(data.finishTime) : null,
        enabled: data.enabled ?? true,
      },
    });
    return NextResponse.json(notification);
  } catch (e) {
    console.error("Failed to update notification:", e);
    return NextResponse.json(
      {
        error: "Could not save notification. Has the database schema been updated (npm run db:push)?",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
