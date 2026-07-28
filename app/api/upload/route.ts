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

// Images (for photos, flyers, artwork) plus PDF (printable flyers/programmes).
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/heic",
  "application/pdf",
]);
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Please choose an image or a PDF." },
      { status: 400 }
    );
  }
  if (file.size === 0) return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is too large (max 25 MB)." }, { status: 400 });
  }

  const url = await uploadFile(file, "uploads");
  const media = await prisma.media.create({
    data: {
      // Clipboard pastes arrive with no name; give them a readable one.
      filename: file.name || `pasted-${Date.now()}`,
      url,
      mimeType: file.type,
      size: file.size,
    },
  });
  return NextResponse.json(media);
}
