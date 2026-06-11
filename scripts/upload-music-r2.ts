import "dotenv/config";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Uploads every audio file under public/music/** to the R2 bucket, preserving
// the path (key = "music/<album>/<file>"), then repoints each Track.audioUrl
// from the local "/music/..." path to the absolute R2 public URL.
//
// Run:  npx tsx scripts/upload-music-r2.ts          (upload + update DB)
//       npx tsx scripts/upload-music-r2.ts --dry-run (list what it would do)

const DRY = process.argv.includes("--dry-run");

const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME, R2_PUBLIC_URL, DATABASE_URL,
} = process.env;

const CONTENT_TYPES: Record<string, string> = {
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
};

function requireEnv() {
  const missing = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}\nFill them in .env first.`);
    process.exit(1);
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "covers") continue; // committed images, not audio
      out.push(...(await walk(full)));
    } else if (CONTENT_TYPES[path.extname(entry.name).toLowerCase()]) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  requireEnv();
  const publicDir = path.join(process.cwd(), "public");
  const musicDir = path.join(publicDir, "music");
  const files = await walk(musicDir);
  console.log(`Found ${files.length} audio files under public/music`);

  const base = R2_PUBLIC_URL!.replace(/\/+$/, "");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
  });

  // localPath ("/music/...") -> public R2 URL
  const mapping = new Map<string, string>();

  for (const abs of files) {
    const rel = path.relative(publicDir, abs).split(path.sep).join("/"); // music/album/file.m4a
    const localUrl = `/${rel}`;
    const r2Url = `${base}/${rel}`;
    mapping.set(localUrl, r2Url);

    if (DRY) { console.log(`would upload  ${rel}`); continue; }

    // Skip if already present (idempotent re-runs)
    let exists = false;
    try { await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME!, Key: rel })); exists = true; } catch {}
    if (exists) { console.log(`skip (exists) ${rel}`); continue; }

    const body = await readFile(abs);
    const size = (await stat(abs)).size;
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: rel,
      Body: body,
      ContentType: CONTENT_TYPES[path.extname(abs).toLowerCase()],
    }));
    console.log(`uploaded ${rel} (${(size / 1048576).toFixed(1)} MB)`);
  }

  // Repoint Track.audioUrl values that point at local /music/... paths
  const adapter = new PrismaPg({ connectionString: DATABASE_URL ?? "" });
  const prisma = new PrismaClient({ adapter });
  const tracks = await prisma.track.findMany({ where: { audioUrl: { startsWith: "/music/" } } });
  let updated = 0;
  for (const t of tracks) {
    const r2 = mapping.get(t.audioUrl!);
    if (!r2) { console.warn(`no uploaded file for track audioUrl: ${t.audioUrl}`); continue; }
    if (!DRY) await prisma.track.update({ where: { id: t.id }, data: { audioUrl: r2 } });
    updated++;
  }
  console.log(`\n${DRY ? "[dry-run] would update" : "updated"} ${updated} track audioUrl(s) to R2`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
