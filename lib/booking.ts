import { z } from "zod";
import type { Event, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const participantSchema = z.object({
  name: z.string().trim().min(1, "Each participant needs a name"),
  isChild: z.boolean().optional().default(false),
  dietary: z.string().trim().optional(),
});

export const bookingSchema = z.object({
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().email("A valid email is required"),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  participants: z.array(participantSchema).min(1, "Add at least one participant"),
  amountCents: z.number().int().nonnegative().optional().default(0),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Count people currently holding a spot (pending or confirmed) for an event. */
export async function spotsTaken(eventId: string): Promise<number> {
  return prisma.eventRegistration.count({
    where: { eventId, status: { in: ["PENDING", "CONFIRMED"] } },
  });
}

/**
 * Create a Booking plus one EventRegistration per participant in a single
 * transaction. Returns the booking with its participants and whether the party
 * landed on the waitlist (because it didn't fit the remaining capacity).
 */
export async function createBooking({
  event,
  input,
  paymentMethod,
  paymentStatus = "UNPAID",
  paypalOrderId = null,
  forceWaitlist = false,
}: {
  event: Event;
  input: BookingInput;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paypalOrderId?: string | null;
  forceWaitlist?: boolean;
}) {
  let waitlisted = forceWaitlist;
  if (!waitlisted && event.capacity) {
    const taken = await spotsTaken(event.id);
    if (taken + input.participants.length > event.capacity) waitlisted = true;
  }

  const status = waitlisted ? "WAITLISTED" : paymentStatus === "PAID" ? "CONFIRMED" : "PENDING";
  const phone = input.phone || null;

  const booking = await prisma.booking.create({
    data: {
      eventId: event.id,
      name: input.name,
      email: input.email,
      phone,
      notes: input.notes || null,
      status,
      paymentMethod: waitlisted ? "NONE" : paymentMethod,
      paymentStatus: waitlisted ? "UNPAID" : paymentStatus,
      amountCents: waitlisted ? 0 : input.amountCents,
      paypalOrderId,
      participants: {
        create: input.participants.map((p) => ({
          eventId: event.id,
          name: p.name,
          email: input.email,
          phone,
          dietary: p.dietary || null,
          isChild: Boolean(p.isChild),
          status,
        })),
      },
    },
    include: { participants: true },
  });

  return { booking, waitlisted };
}
