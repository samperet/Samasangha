import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await prisma.mureedProfile.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const name = String(data.name ?? "").trim();
  const location = String(data.location ?? "").trim();
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const photoUrl = String(data.photoUrl ?? "").trim();

  if (!name || !location || !email) {
    return NextResponse.json({ error: "Name, location, and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const profile = await prisma.mureedProfile.create({
    data: { name, location, email, phone: phone || null, photoUrl: photoUrl || null },
  });
  return NextResponse.json(profile, { status: 201 });
}
