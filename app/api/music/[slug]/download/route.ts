import { prisma } from "@/lib/prisma";
import { ZipArchive } from "archiver";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";

// Streams a ZIP of an album's audio files. Files are stored (not re-compressed)
// since m4a/mp3 are already compressed — keeps it fast and low-CPU.
//
// Note: archiver v8 is ESM-only and exposes archive classes (ZipArchive, …)
// rather than the v7 default factory function.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const album = await prisma.album
    .findUnique({
      where: { slug, published: true },
      include: { tracks: { orderBy: { order: "asc" } } },
    })
    .catch(() => null);

  if (!album) return new Response("Album not found", { status: 404 });

  const publicDir = path.join(process.cwd(), "public");
  const files = album.tracks
    .filter((t) => t.audioUrl)
    .map((t, i) => {
      const rel = t.audioUrl!.replace(/^\/+/, "");
      const abs = path.join(publicDir, rel);
      const ext = path.extname(rel) || ".m4a";
      // Friendly in-zip name: "01 Track Title.m4a"
      const safeTitle = t.title.replace(/[\\/:*?"<>|]+/g, "-").trim();
      const name = `${String(i + 1).padStart(2, "0")} ${safeTitle}${ext}`;
      return { abs, name };
    })
    .filter((f) => fs.existsSync(f.abs));

  if (files.length === 0) {
    return new Response("No downloadable tracks for this album", { status: 404 });
  }

  const archive = new ZipArchive({ store: true });
  for (const f of files) archive.file(f.abs, { name: f.name });
  void archive.finalize();

  const zipName = album.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const body = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
