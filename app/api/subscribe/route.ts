import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMailchimpConfigured, subscribeToMailchimp } from "@/lib/mailchimp";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  // Honeypot: a field the form hides from people but bots fill in.
  company: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in your name and a valid email address." },
      { status: 400 }
    );
  }

  const { email, firstName, lastName, company } = parsed.data;

  // A bot filled the hidden field. Answer as though it worked, so it learns nothing.
  if (company) return NextResponse.json({ ok: true, message: "Thank you! You're on the list." });

  // Keep our own record first, and don't let a database outage stop the signup
  // — Mailchimp is the list that actually matters.
  await prisma.subscriber
    .upsert({
      where: { email },
      update: { active: true, firstName, lastName },
      create: { email, firstName, lastName },
    })
    .catch((err) => console.error("[subscribe] could not record subscriber", err));

  if (!isMailchimpConfigured()) {
    // Local development, or the keys aren't set on the deployment yet. The
    // address is saved either way; log loudly so this isn't missed in production.
    console.warn("[subscribe] Mailchimp is not configured — %s was only saved locally", email);
    return NextResponse.json({ ok: true, message: "Thank you! You're on the list." });
  }

  const result = await subscribeToMailchimp(email, { firstName, lastName });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.reason === "failed" ? 502 : 400 }
    );
  }

  return NextResponse.json({ ok: true, message: "Thank you! You're on the list." });
}
