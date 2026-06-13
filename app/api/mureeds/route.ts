import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB

async function isUnlocked(): Promise<boolean> {
  const store = await cookies();
  return (
    (await verifyDeepeningToken(store.get(DEEPENING_COOKIE)?.value)) ||
    (await verifySessionToken(store.get(ADMIN_COOKIE)?.value))
  );
}

export async function POST(req: NextRequest) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const photo = form.get("photo");

  if (!name || !location || !email) {
    return NextResponse.json(
      { error: "Name, location, and email are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "The photo must be an image." }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Photo too large (max 8 MB)." }, { status: 400 });
    }
    photoUrl = await uploadFile(photo, "mureeds");
  }

  const profile = await prisma.mureedProfile.create({
    data: { name, location, email, phone: phone || null, photoUrl },
  });

  return NextResponse.json({ ok: true, id: profile.id });
}
