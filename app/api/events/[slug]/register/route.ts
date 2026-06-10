import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmails } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  dietary: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!event.registrationEnabled) return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  if (!event.published) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Deadline check
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json({ error: "Registration has closed" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, email, phone, dietary, notes } = parsed.data;

  // Capacity check
  if (event.capacity) {
    const confirmed = await prisma.eventRegistration.count({
      where: { eventId: event.id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (confirmed >= event.capacity) {
      const reg = await prisma.eventRegistration.create({
        data: { eventId: event.id, name, email, phone, dietary, notes, status: "WAITLISTED" },
      });
      await sendRegistrationEmails({ event, registration: reg, waitlisted: true }).catch(console.error);
      return NextResponse.json({ status: "waitlisted" });
    }
  }

  const reg = await prisma.eventRegistration.create({
    data: { eventId: event.id, name, email, phone, dietary, notes, status: "PENDING" },
  });

  await sendRegistrationEmails({ event, registration: reg, waitlisted: false }).catch(console.error);
  return NextResponse.json({ status: "registered", id: reg.id });
}
