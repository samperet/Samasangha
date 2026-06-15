import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatDateRange } from "@/lib/utils";
import { eventPricing } from "@/lib/pricing";
import type { Metadata } from "next";
import RetreatPriceSlider from "./RetreatPriceSlider";
import EatDancePrayLayout from "./EatDancePrayLayout";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } }).catch(() => null);
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findFirst({
    where: { slug, published: true },
    include: {
      _count: { select: { registrations: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
    },
  }).catch(() => null);

  if (!event) notFound();

  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;
  const registrationClosed =
    !event.registrationEnabled ||
    (event.registrationDeadline ? new Date() > event.registrationDeadline : false);
  const full = spotsLeft !== null && spotsLeft <= 0;

  const pricing = eventPricing(event);

  if (slug === "eat-dance-pray-2026") {
    return (
      <EatDancePrayLayout
        event={event}
        pricing={{
          min: pricing.min,
          max: pricing.max,
          note:
            pricing.earlyBirdActive && pricing.earlyBirdDeadline
              ? `Early-bird pricing until ${formatDate(pricing.earlyBirdDeadline)}`
              : undefined,
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <Link
        href="/events/upcoming"
        className="text-sm mb-8 inline-block transition-colors"
        style={{ color: "var(--fg3)" }}
      >
        ← Events
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-3 mb-4">
          {event.isRetreat && (
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: "var(--gold-700)", letterSpacing: "0.12em" }}
            >
              Retreat
            </span>
          )}
          {event.isOnline && (
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: "var(--lapis-700)", letterSpacing: "0.12em" }}
            >
              Online
            </span>
          )}
        </div>
        <h1 className="font-serif mb-4 leading-tight" style={{ fontSize: "2.5rem", fontWeight: 500, color: "var(--ink-900)" }}>
          {event.title}
        </h1>

        {/* Meta grid */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
          <div>
            <dt className="eyebrow" style={{ fontSize: "0.7rem" }}>Date</dt>
            <dd className="mt-1" style={{ color: "var(--fg1)" }}>
              {formatDateRange(event.startDate, event.endDate)}
            </dd>
          </div>
          {(event.location || event.isOnline) && (
            <div>
              <dt className="eyebrow" style={{ fontSize: "0.7rem" }}>Location</dt>
              <dd className="mt-1" style={{ color: "var(--fg1)" }}>
                {event.isOnline ? "Online" : event.location}
              </dd>
            </div>
          )}
          {event.registrationEnabled && (
            <div>
              <dt className="eyebrow" style={{ fontSize: "0.7rem" }}>Cost</dt>
              <dd className="mt-1" style={{ color: "var(--fg1)" }}>
                {pricing.label}
                {pricing.earlyBirdActive && pricing.earlyBirdDeadline && (
                  <span className="block text-xs mt-0.5" style={{ color: "var(--gold-700)" }}>
                    Early bird until {formatDate(pricing.earlyBirdDeadline)}
                  </span>
                )}
                {pricing.kidsLabel && (
                  <span className="block text-xs mt-0.5" style={{ color: "var(--fg2)" }}>
                    {pricing.kidsLabel}
                  </span>
                )}
              </dd>
            </div>
          )}
          {spotsLeft !== null && (
            <div>
              <dt className="eyebrow" style={{ fontSize: "0.7rem" }}>Availability</dt>
              <dd className="mt-1" style={{ color: full ? "var(--crimson-700)" : "var(--fg1)" }}>
                {full ? "Full, waitlist available" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`}
              </dd>
            </div>
          )}
        </dl>

        {/* Flyer */}
        {event.flyerUrl && (
          <img src={event.flyerUrl} alt={event.title} className="w-full rounded-xl mb-6 object-cover max-h-80" />
        )}
      </div>

      {/* Description */}
      <div
        className="prose prose-stone max-w-none leading-relaxed mb-12"
        style={{ color: "var(--fg1)" }}
      >
        {event.description.split("\n").filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-7"
        style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
      >
        {event.registrationEnabled && !registrationClosed ? (
          <>
            <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}>
              {full ? "Join the waitlist" : "Register for this event"}
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--fg2)" }}>
              {full
                ? "This retreat is full. Add your name to the waitlist and we'll contact you if a space opens."
                : "Fill in your details below and we'll confirm your spot."}
            </p>
            <Link
              href={`/events/${slug}/register`}
              className="inline-block font-semibold px-6 py-3 rounded-lg text-sm transition-all duration-200"
              style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)", boxShadow: "var(--shadow-sm)" }}
            >
              {full ? "Join waitlist" : "Register now"}
            </Link>
          </>
        ) : event.isRetreat && pricing.type === "SLIDING" && pricing.min != null && pricing.max != null ? (
          <RetreatPriceSlider
            priceMin={pricing.min}
            priceMax={pricing.max}
            note={
              pricing.earlyBirdActive && pricing.earlyBirdDeadline
                ? `Early-bird pricing until ${formatDate(pricing.earlyBirdDeadline)}`
                : undefined
            }
          />
        ) : event.registerUrl ? (
          <>
            <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 500 }}>
              Register for this event
            </h2>
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold px-6 py-3 rounded-lg text-sm"
              style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)" }}
            >
              Register →
            </a>
          </>
        ) : registrationClosed && event.registrationEnabled ? (
          <p className="text-sm" style={{ color: "var(--fg2)" }}>
            Registration for this event has closed.
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--fg2)" }}>
            To attend, please{" "}
            <Link href="/contact" style={{ color: "var(--crimson-700)" }}>contact us</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
