import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatDateRange } from "@/lib/utils";
import { eventPricing } from "@/lib/pricing";
import type { Metadata } from "next";
import RegistrationForm from "./RegistrationForm";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } }).catch(() => null);
  return { title: `Register, ${event?.title ?? "Event"}` };
}

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findFirst({
    where: { slug, published: true },
    include: {
      _count: { select: { registrations: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
    },
  }).catch(() => null);

  if (!event) notFound();
  if (!event.registrationEnabled) notFound();

  const deadlinePassed = event.registrationDeadline ? new Date() > event.registrationDeadline : false;
  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;
  const full = spotsLeft !== null && spotsLeft <= 0;

  const pricing = eventPricing(event);
  const priceStr = pricing.type === "FREE" ? null : pricing.label;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Event summary */}
      <div className="mb-10 pb-8" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <p className="eyebrow mb-2" style={{ color: "var(--fg3)" }}>
          {full ? "Join the waitlist" : "Registration"}
        </p>
        <h1 className="font-serif mb-3" style={{ fontSize: "2rem", fontWeight: 500, color: "var(--ink-900)" }}>
          {event.title}
        </h1>
        <p className="text-sm" style={{ color: "var(--fg2)" }}>
          {formatDateRange(event.startDate, event.endDate)}
          {(event.location || event.isOnline) && (
            <span> · {event.isOnline ? "Online" : event.location}</span>
          )}
        </p>
        {priceStr && (
          <p className="text-sm mt-1" style={{ color: "var(--gold-700)" }}>
            {priceStr}
            {pricing.earlyBirdActive && pricing.earlyBirdDeadline && (
              <span> · until {formatDate(pricing.earlyBirdDeadline)}</span>
            )}
          </p>
        )}
        {full && (
          <p
            className="text-sm mt-3 px-3 py-2 rounded-lg inline-block"
            style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}
          >
            This retreat is full. You'll be added to the waitlist.
          </p>
        )}
      </div>

      {deadlinePassed ? (
        <div className="text-center py-8">
          <p className="text-lg font-serif" style={{ color: "var(--ink-900)" }}>Registration has closed.</p>
          <p className="text-sm mt-2" style={{ color: "var(--fg2)" }}>
            Please <a href="/contact" style={{ color: "var(--crimson-700)" }}>contact us</a> if you have questions.
          </p>
        </div>
      ) : (
        <RegistrationForm slug={slug} isFull={full} />
      )}
    </div>
  );
}
