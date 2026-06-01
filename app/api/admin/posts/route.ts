import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const posts = await prisma.post.findMany({
    where: category ? { category: category as never } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const slug = data.slug || slugify(data.title);
  const post = await prisma.post.create({
    data: { ...data, slug, publishedAt: data.published ? new Date() : null },
  });
  return NextResponse.json(post);
}
