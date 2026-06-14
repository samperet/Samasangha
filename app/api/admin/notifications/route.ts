import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NotificationPage } from "@prisma/client";

const VALID_PAGES: NotificationPage[] = ["HOMEPAGE", "TUESDAY", "DANCES"];

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  if (!data.message || typeof data.message !== "string" || !data.message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (!VALID_PAGES.includes(data.page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        message: data.message.trim(),
        page: data.page,
        startTime: data.startTime ? new Date(data.startTime) : null,
        finishTime: data.finishTime ? new Date(data.finishTime) : null,
        enabled: data.enabled ?? true,
      },
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (e) {
    console.error("Failed to create notification:", e);
    return NextResponse.json(
      { error: "Could not save notification. Has the database schema been updated (npm run db:push)?" },
      { status: 500 },
    );
  }
}
