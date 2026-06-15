import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingEmails } from "@/lib/mail";
import { bookingQuote } from "@/lib/pricing";
import { bookingSchema, createBooking } from "@/lib/booking";
import { z } from "zod";

// Handles free, check, and waitlist registrations. PayPal/card payments go
// through /api/events/[slug]/paypal/* instead.
const schema = bookingSchema.extend({
  paymentMethod: z.enum(["NONE", "CHECK"]).optional().default("NONE"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.published) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!event.registrationEnabled) return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json({ error: "Registration has closed" }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  // Is the party going to fit? If not, force the waitlist (no payment taken).
  const taken = event.capacity
    ? await prisma.eventRegistration.count({
        where: { eventId: event.id, status: { in: ["PENDING", "CONFIRMED"] } },
      })
    : 0;
  const full = event.capacity ? taken + input.participants.length > event.capacity : false;

  const quote = bookingQuote(event, input.participants);
  const isFree = quote.type === "FREE";

  // Validate the amount for paid (check) bookings that will actually be charged.
  if (!full && !isFree && input.paymentMethod === "CHECK") {
    const amount = input.amountCents;
    if (amount < quote.minCents || amount > quote.maxCents) {
      return NextResponse.json(
        { error: "The amount is outside the allowed range for this event." },
        { status: 400 }
      );
    }
  }

  const paymentMethod = full || isFree ? "NONE" : input.paymentMethod;
  const amountCents = full || isFree ? 0 : input.amountCents;

  const { booking, waitlisted } = await createBooking({
    event,
    input: { ...input, amountCents },
    paymentMethod,
    paymentStatus: "UNPAID",
    forceWaitlist: full,
  });

  await sendBookingEmails({ event, booking, participants: booking.participants }).catch(console.error);

  return NextResponse.json({
    status: waitlisted ? "waitlisted" : paymentMethod === "CHECK" ? "check" : "registered",
    bookingId: booking.id,
  });
}
