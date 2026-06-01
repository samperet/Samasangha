import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    update: { active: true },
    create: { email: parsed.data.email },
  });
  return NextResponse.json({ ok: true });
}
