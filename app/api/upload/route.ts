import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(media);
}

const ALLOWED = ALLOWED_UPLOAD_TYPES;
const MAX_BYTES = MAX_UPLOAD_BYTES;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // A JSON body means the browser already PUT the file straight to R2 via a
  // presigned URL; we only need to record it in the media library.
  if (req.headers.get("content-type")?.includes("application/json")) {
    const { url, filename, mimeType, size } = (await req.json().catch(() => ({}))) as {
      url?: string;
      filename?: string;
      mimeType?: string;
      size?: number;
    };
    const base = process.env.R2_PUBLIC_URL;
    // Only accept URLs in our own bucket, so this can't record arbitrary links.
    if (!url || !base || !url.startsWith(`${base}/`)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }
    if (!mimeType || !ALLOWED.has(mimeType)) {
      return NextResponse.json({ error: "Please choose an image or a PDF." }, { status: 400 });
    }
    const media = await prisma.media.create({
      data: {
        filename: filename || `pasted-${Date.now()}`,
        url,
        mimeType,
        size: typeof size === "number" ? size : 0,
      },
    });
    return NextResponse.json(media);
  }

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
