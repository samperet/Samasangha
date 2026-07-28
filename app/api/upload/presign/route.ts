import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, storageKey } from "@/lib/storage";

/**
 * Hands back a short-lived URL the browser can PUT a file straight to, so large
 * uploads never travel through this function. Serverless platforms cap a
 * function's request body (4.5 MB on Vercel), which a big flyer PDF blows past
 * long before our own limit — a direct upload sidesteps that entirely.
 *
 * Returns 501 when R2 isn't configured (e.g. local dev writing to public/), and
 * the client falls back to posting the file through /api/upload.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ready =
    process.env.STORAGE_PROVIDER === "r2" &&
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL;
  if (!ready) {
    return NextResponse.json({ error: "Direct upload not configured" }, { status: 501 });
  }

  const { filename, contentType, size } = (await req.json().catch(() => ({}))) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };

  if (!contentType || !ALLOWED_UPLOAD_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Please choose an image or a PDF." }, { status: 400 });
  }
  if (typeof size !== "number" || size <= 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }
  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `That file is too large (max ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).` },
      { status: 400 }
    );
  }

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const key = storageKey(filename ?? "", contentType, "uploads");
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 600 }
  );

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  });
}
