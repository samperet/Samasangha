import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

/**
 * The publish date is set once, the first time a post goes live, and left alone
 * after that. It used to be stamped with `new Date()` on every save, and since
 * the public teachings list is ordered by it, editing a 2022 talk sent it
 * straight back to the top of the page.
 */
async function publishedAtFor(id: string, published: unknown): Promise<Date | undefined> {
  if (published !== true) return undefined; // unpublishing keeps the old date
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  return existing?.publishedAt ? undefined : new Date();
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const publishedAt = await publishedAtFor(id, data.published);
  const post = await prisma.post.update({
    where: { id },
    data: { ...data, ...(publishedAt ? { publishedAt } : {}) },
  });
  revalidatePath("/", "layout");
  return NextResponse.json(post);
}

/**
 * Single-field edits from the teachings list: the category dropdown, the video
 * link, the publish toggle. A whitelist rather than a spread, so a stray key
 * in the body can't overwrite the title or the content.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const data: { category?: never; youtubeUrl?: string | null; published?: boolean; publishedAt?: Date } = {};

  if ("category" in body) {
    if (typeof body.category !== "string") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    data.category = body.category as never;
  }

  if ("youtubeUrl" in body) {
    const raw = typeof body.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
    data.youtubeUrl = raw === "" ? null : raw;
  }

  if ("published" in body) {
    if (typeof body.published !== "boolean") {
      return NextResponse.json({ error: "Invalid published flag" }, { status: 400 });
    }
    data.published = body.published;
    const publishedAt = await publishedAtFor(id, body.published);
    if (publishedAt) data.publishedAt = publishedAt;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const post = await prisma.post.update({ where: { id }, data });
    revalidatePath("/", "layout");
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
