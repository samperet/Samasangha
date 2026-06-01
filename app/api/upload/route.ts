import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(media);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const url = await uploadFile(file, "uploads");
  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url,
      mimeType: file.type,
      size: file.size,
    },
  });
  return NextResponse.json(media);
}
