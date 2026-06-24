import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Public: the approved community takes, with email withheld.
export async function GET() {
  const recordings = await prisma.lokaRecording
    .findMany({
      where: { approved: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        voiceType: true,
        audioUrl: true,
        mimeType: true,
        durationMs: true,
        offsetMs: true,
        startMs: true,
      },
    })
    .catch(() => []);
  // Serve takes through our same-origin proxy so the Web Audio mixer can fetch
  // + decode them without needing CORS on the storage bucket.
  return NextResponse.json(
    recordings.map((r) => ({ ...r, audioUrl: `/api/loka/audio/${r.id}` }))
  );
}

const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB — video takes run larger
const VOICES = ["LOWER", "HIGHER"] as const;
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Public: submit a take. Stored unapproved until an admin reviews it.
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  const name = (form.get("name") as string | null)?.trim() ?? "";
  const email = (form.get("email") as string | null)?.trim() ?? "";
  const voiceType = (form.get("voiceType") as string | null)?.trim() ?? "";
  const offsetMs = Math.max(0, Math.round(Number(form.get("offsetMs") ?? 0)) || 0);
  const startMs = Math.max(0, Math.round(Number(form.get("startMs") ?? 0)) || 0);
  const durationMs = Math.max(0, Math.round(Number(form.get("durationMs") ?? 0)) || 0);

  if (!(file instanceof File)) return NextResponse.json({ error: "No audio file" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  // Email is optional, but if given it must look valid.
  if (email && !emailRe.test(email)) return NextResponse.json({ error: "That email doesn't look right" }, { status: 400 });
  if (!VOICES.includes(voiceType as (typeof VOICES)[number])) {
    return NextResponse.json({ error: "Choose a voice range" }, { status: 400 });
  }
  const isVideo = file.type.startsWith("video/");
  if (!file.type.startsWith("audio/") && !isVideo) {
    return NextResponse.json({ error: "File must be audio or video" }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ error: "Recording is empty" }, { status: 400 });
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_AUDIO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `Recording is too large (max ${isVideo ? 100 : 30} MB)` },
      { status: 400 }
    );
  }

  let audioUrl: string;
  try {
    audioUrl = await uploadFile(file, "loka");
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save the recording. Please try again." }, { status: 502 });
  }

  const rec = await prisma.lokaRecording.create({
    data: {
      name,
      email,
      voiceType: voiceType as (typeof VOICES)[number],
      audioUrl,
      mimeType: file.type,
      durationMs: durationMs || null,
      offsetMs,
      startMs,
      // Auto-published; admins can still remove a take from /admin/loka.
      approved: true,
    },
  });

  return NextResponse.json({ id: rec.id, status: "submitted" });
}
