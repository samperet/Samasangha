import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Streams the Loka backing track through our own origin so the Web Audio
// studio can fetch + decode it without needing CORS on the storage bucket.
export async function GET(req: Request) {
  const track = await prisma.track
    .findFirst({
      where: { title: { contains: "loka", mode: "insensitive" }, audioUrl: { not: null } },
      orderBy: { album: { year: "desc" } },
      select: { audioUrl: true },
    })
    .catch(() => null);

  const url = track?.audioUrl;
  if (!url) return new NextResponse("Backing track not found", { status: 404 });

  const target = url.startsWith("http") ? url : new URL(url, req.url).toString();
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
      "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
