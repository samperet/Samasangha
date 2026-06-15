import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingEmails } from "@/lib/mail";
import { captureOrder, isPaypalConfigured } from "@/lib/paypal";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  bookingId: z.string().min(1),
});

// Captures an approved PayPal order and confirms the booking.
export async function POST(req: NextRequest) {
  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: "Online payment is not configured." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { orderId, bookingId } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, participants: true },
  });
  if (!booking || booking.paypalOrderId !== orderId) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Already captured (e.g. a double click) — treat as success, don't re-email.
  if (booking.paymentStatus === "PAID") {
    return NextResponse.json({ status: "paid" });
  }

  let result;
  try {
    result = await captureOrder(orderId);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment could not be completed." }, { status: 502 });
  }
  if (!result.completed) {
    return NextResponse.json({ error: "Payment was not completed." }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      amountCents: result.amountCents ?? booking.amountCents,
      participants: { updateMany: { where: {}, data: { status: "CONFIRMED" } } },
    },
    include: { participants: true },
  });

  await sendBookingEmails({
    event: booking.event,
    booking: updated,
    participants: updated.participants,
  }).catch(console.error);

  return NextResponse.json({ status: "paid" });
}
