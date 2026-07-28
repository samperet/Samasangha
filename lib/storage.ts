import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Extensions for the types we accept, so clipboard pastes (whose File often has
// no name, or a generic "image.png") still land with a sensible extension.
const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "image/heic": ".heic",
  "application/pdf": ".pdf",
};

// Prefer the uploaded filename's extension; fall back to the MIME type.
function extFor(file: File): string {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && /^\.[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return MIME_EXT[file.type] ?? "";
}

export async function uploadFile(
  file: File,
  folder = "uploads"
): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "r2") {
    return uploadToR2(file, folder);
  }
  return uploadToLocal(file, folder);
}

async function uploadToLocal(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = extFor(file);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/${folder}/${name}`;
}

async function uploadToR2(file: File, folder: string): Promise<string> {
  // Dynamic import to avoid loading AWS SDK in local dev
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  const bytes = await file.arrayBuffer();
  const ext = extFor(file);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    })
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
