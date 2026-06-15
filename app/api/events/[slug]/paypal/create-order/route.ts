import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingQuote } from "@/lib/pricing";
import { bookingSchema, createBooking, spotsTaken } from "@/lib/booking";
import { createOrder, isPaypalConfigured } from "@/lib/paypal";

// Creates a pending (unpaid) Booking and a matching PayPal order. The browser
// renders the PayPal buttons with the returned orderId, then calls ../capture.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: "Online payment is not configured." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.published) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!event.registrationEnabled) return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json({ error: "Registration has closed" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  // No online payment for sold-out parties — they should use the waitlist.
  if (event.capacity) {
    const taken = await spotsTaken(event.id);
    if (taken + input.participants.length > event.capacity) {
      return NextResponse.json({ error: "This event is full. Please join the waitlist." }, { status: 409 });
    }
  }

  const quote = bookingQuote(event, input.participants);
  if (quote.type === "FREE" || input.amountCents <= 0) {
    return NextResponse.json({ error: "No payment is required for this event." }, { status: 400 });
  }
  if (input.amountCents < quote.minCents || input.amountCents > quote.maxCents) {
    return NextResponse.json(
      { error: "The amount is outside the allowed range for this event." },
      { status: 400 }
    );
  }

  let orderId: string;
  try {
    orderId = await createOrder(input.amountCents, `${event.title} — ${input.participants.length} participant(s)`);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }

  const { booking } = await createBooking({
    event,
    input,
    paymentMethod: "PAYPAL",
    paymentStatus: "UNPAID",
    paypalOrderId: orderId,
  });

  return NextResponse.json({ orderId, bookingId: booking.id });
}
