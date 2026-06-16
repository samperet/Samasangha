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
      },
    })
    .catch(() => []);
  return NextResponse.json(recordings);
}

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB
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
  const durationMs = Math.max(0, Math.round(Number(form.get("durationMs") ?? 0)) || 0);

  if (!(file instanceof File)) return NextResponse.json({ error: "No audio file" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  if (!emailRe.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  if (!VOICES.includes(voiceType as (typeof VOICES)[number])) {
    return NextResponse.json({ error: "Choose a voice range" }, { status: 400 });
  }
  if (!file.type.startsWith("audio/")) return NextResponse.json({ error: "File must be audio" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "Recording is empty" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Recording is too large (max 30 MB)" }, { status: 400 });

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
      approved: false,
    },
  });

  return NextResponse.json({ id: rec.id, status: "submitted" });
}
