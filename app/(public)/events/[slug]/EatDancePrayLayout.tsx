"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/utils";
import RetreatPriceSlider from "./RetreatPriceSlider";

interface EventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isOnline: boolean;
  priceMin: number | null;
  priceMax: number | null;
  registerUrl: string | null;
  flyerUrl: string | null;
  featuredImageUrl: string | null;
}

// Early-bird-aware prices computed by the server page (lib/pricing)
interface PricingProps {
  min: number | null;
  max: number | null;
  note?: string;
}

export default function EatDancePrayLayout({
  event,
  pricing,
}: {
  event: EventData;
  pricing?: PricingProps;
}) {
  const priceMin = pricing?.min ?? event.priceMin;
  const priceMax = pricing?.max ?? event.priceMax;
  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "min(75vh, 640px)" }}>
        <Image
          src="/assets/EDPYurt.jpg"
          alt="Eat, Dance and Pray, gathering in the yurt"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(18,12,4,0.15) 0%, rgba(18,12,4,0.72) 100%)" }}
        />

        {/* Back link */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/events/upcoming"
            className="text-sm font-medium px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            ← Events
          </Link>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-14 md:pb-14 text-center">
          <span
            className="inline-block mb-4 text-xs font-semibold uppercase px-3 py-1 rounded-full"
            style={{ background: "var(--gold-500)", color: "#1a0e00", letterSpacing: "0.15em" }}
          >
            Retreat · {formatDateRange(event.startDate, event.endDate)}
          </span>
          <h1
            className="font-serif"
            style={{ fontSize: "clamp(2rem, 6vw, 3.8rem)", fontWeight: 500, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            {event.title}
          </h1>
          {event.location && (
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {event.location}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-5 py-14">

        {/* Pull quote */}
        <blockquote
          className="font-serif italic text-center mb-14"
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.65rem)",
            fontWeight: 400,
            lineHeight: 1.55,
            color: "var(--ink-800)",
            borderLeft: "none",
            padding: "0 1rem",
          }}
        >
          &quot;Eat, Dance, and Pray together is the actualized vision Sufi Murshid Samuel Lewis held for world peace.&quot;
        </blockquote>

        {/* Description */}
        <div
          className="leading-relaxed mb-12 text-base"
          style={{ color: "var(--fg1)" }}
        >
          <p className="mb-4">
            With <strong>Abraham &amp; Halima</strong>, Malika (Colombia) &amp; Friends, this year&apos;s retreat invites us to tune into our natural rhythms and demonstrate Peace and Harmony.
          </p>
          <p className="mb-4">
            We gather to BE present together: to practice simple presence with the Walks and Dances of Universal Peace, Zikr, Meditation, Silence, Listening, Kirtan, and Yoga.
          </p>
          <p>
            Our intentions are toward 7 generations, toward Peace on Earth.
          </p>
        </div>

        {/* Details band */}
        <div
          className="gold-shadow rounded-2xl overflow-hidden mb-10"
          style={{ border: "1px solid var(--surface-border)" }}
        >
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "var(--surface-border)" }}>
            {[
              { label: "Dates",    value: formatDateRange(event.startDate, event.endDate) },
              { label: "Location", value: event.location ?? "Rural Massachusetts" },
              { label: "Open to",  value: "All are welcome" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4" style={{ background: "var(--parch-50)" }}>
                <dt className="eyebrow mb-1" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>{label}</dt>
                <dd className="text-sm font-medium" style={{ color: "var(--ink-900)" }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {event.flyerUrl && (
          <div className="mb-10">
            <a
              href={event.flyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold px-6 py-3 rounded-lg text-sm"
              style={{
                background: "var(--lapis-700)",
                color: "var(--fg-on-dark)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              View flyer
            </a>
          </div>
        )}

        {/* Registration / pricing */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
        >
          {event.featuredImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.featuredImageUrl}
              alt={event.title}
              className="w-full rounded-xl mb-6 object-cover max-h-72"
            />
          )}
          {priceMin != null && priceMax != null ? (
            <RetreatPriceSlider priceMin={priceMin} priceMax={priceMax} note={pricing?.note} />
          ) : event.registerUrl ? (
            <>
              <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}>
                Reserve your place
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--fg2)" }}>
                Spaces are limited. Register early to secure your spot.
              </p>
              <a
                href={event.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-semibold px-7 py-3 rounded-lg text-sm"
                style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
              >
                Register now →
              </a>
            </>
          ) : (
            <>
              <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}>
                Reserve your place
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--fg2)" }}>
                Spaces are limited. Get in touch to secure your spot.
              </p>
              <Link
                href="/contact"
                className="inline-block font-semibold px-7 py-3 rounded-lg text-sm"
                style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
              >
                Contact us to register →
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
