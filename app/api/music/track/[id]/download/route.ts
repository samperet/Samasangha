import { prisma } from "@/lib/prisma";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";

// Streams a single track's audio file as an attachment so the browser
// downloads it (rather than navigating to / previewing the file, which is
// what the `download` attribute does for cross-origin R2 URLs).
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const track = await prisma.track
    .findUnique({ where: { id }, include: { album: true } })
    .catch(() => null);

  if (!track || !track.audioUrl || !track.album?.published) {
    return new Response("Track not found", { status: 404 });
  }

  const url = track.audioUrl;
  const remote = /^https?:\/\//i.test(url);
  const ext = path.extname(url.split("?")[0]) || ".m4a";
  const safeTitle = track.title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "track";
  const filename = `${safeTitle}${ext}`;
  const asciiName = filename.replace(/[^\x20-\x7E]/g, "_");
  const disposition = `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

  if (remote) {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      return new Response("Could not fetch track", { status: 502 });
    }
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  }

  const abs = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
  if (!fs.existsSync(abs)) return new Response("File not found", { status: 404 });

  const body = Readable.toWeb(fs.createReadStream(abs)) as unknown as ReadableStream<Uint8Array>;
  return new Response(body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
