import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Streams an approved take through our own origin (so the Web Audio mixer can
// fetch + decode it without CORS on the storage bucket).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rec = await prisma.lokaRecording
    .findFirst({ where: { id, approved: true }, select: { audioUrl: true } })
    .catch(() => null);

  if (!rec?.audioUrl) return new NextResponse("Not found", { status: 404 });

  const target = rec.audioUrl.startsWith("http") ? rec.audioUrl : new URL(rec.audioUrl, req.url).toString();
  let upstream: Response;
  try {
    upstream = await fetch(target);
  } catch {
    return new NextResponse("Upstream error", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return new NextResponse("Upstream error", { status: 502 });

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "audio/webm",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
