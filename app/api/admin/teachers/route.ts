import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const teachers = await prisma.teacher.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const slug = data.slug || slugify(data.name);
  const teacher = await prisma.teacher.create({ data: { ...data, slug } });
  return NextResponse.json(teacher);
}
