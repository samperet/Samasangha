import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DESIGN_DEFAULTS, sanitizeDesign } from "@/lib/design";

export async function GET() {
  const row = await prisma.siteDesign.findUnique({ where: { id: "default" } }).catch(() => null);
  return NextResponse.json(row ?? { id: "default", ...DESIGN_DEFAULTS });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = sanitizeDesign(body);
  try {
    const row = await prisma.siteDesign.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    // Refresh the homepage so the new colours show up right away.
    revalidatePath("/");
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
