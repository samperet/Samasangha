import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NotificationPage } from "@prisma/client";

const VALID_PAGES: NotificationPage[] = ["HOMEPAGE", "TUESDAY", "DANCES", "MUREEDS"];

// Public endpoint: returns the active notifications for a given page, i.e. those
// that are enabled and currently within their (optional) start/finish window.
export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") as NotificationPage | null;
  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const now = new Date();
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        page,
        enabled: true,
        AND: [
          { OR: [{ startTime: null }, { startTime: { lte: now } }] },
          { OR: [{ finishTime: null }, { finishTime: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, message: true },
    });
    return NextResponse.json(notifications, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
