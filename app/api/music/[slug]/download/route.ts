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
  // Each track's audio is either a remote URL (R2) or a local /public path.
  const entries = album.tracks
    .filter((t) => t.audioUrl)
    .map((t, i) => {
      const url = t.audioUrl!;
      const remote = /^https?:\/\//i.test(url);
      const ext = path.extname(url.split("?")[0]) || ".m4a";
      // Friendly in-zip name: "01 Track Title.m4a"
      const safeTitle = t.title.replace(/[\\/:*?"<>|]+/g, "-").trim();
      const name = `${String(i + 1).padStart(2, "0")} ${safeTitle}${ext}`;
      return { remote, url, name, abs: path.join(publicDir, url.replace(/^\/+/, "")) };
    })
    .filter((e) => e.remote || fs.existsSync(e.abs));

  if (entries.length === 0) {
    return new Response("No downloadable tracks for this album", { status: 404 });
  }

  const archive = new ZipArchive({ store: true });

  // Append entries sequentially: local files from disk, remote files fetched
  // from R2 (one at a time to bound memory). Runs async while the response streams.
  (async () => {
    for (const e of entries) {
      try {
        if (e.remote) {
          const res = await fetch(e.url);
          if (!res.ok) continue;
          archive.append(Buffer.from(await res.arrayBuffer()), { name: e.name });
        } else {
          archive.file(e.abs, { name: e.name });
        }
      } catch {
        // skip a track that fails to fetch rather than aborting the whole zip
      }
    }
    void archive.finalize();
  })();

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
