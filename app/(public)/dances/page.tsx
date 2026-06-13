import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dances of Universal Peace",
  description:
    "Live Dances of Universal Peace in Cambridge, sacred circle dances of chant, live music, and movement, on the third Saturday of each month with SamaSangha.",
};

const PRACTICE = [
  { dt: "When", dd: "Third Saturday of the month" },
  { dt: "Time", dd: "Doors 7:15 PM · Dances 7:30–9:45 PM" },
  { dt: "Where", dd: "Friends Meeting House (Friends room), 5 Longfellow Park, Cambridge, MA 02138" },
  { dt: "Contribution", dd: "$10–15 kindly requested" },
  { dt: "Led by", dd: "SamaSangha with Halima, Abraham & Friends" },
];

const CALENDAR_EVENT = {
  title: "Dances of Universal Peace",
  location: "Friends Meeting House (Friends room), 5 Longfellow Park, Cambridge, MA 02138",
  details:
    "Monthly Dances of Universal Peace with SamaSangha. Doors open at 7:15 PM. Dances begin at 7:30 PM.",
  startLocal: "20260620T193000",
  endLocal: "20260620T214500",
  startUtc: "20260620T233000Z",
  endUtc: "20260621T014500Z",
  recurrence: "RRULE:FREQ=MONTHLY;BYDAY=3SA",
};

const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SamaSangha//Dances of Universal Peace//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:dances-of-universal-peace@samasangha.org",
    `DTSTART;TZID=America/New_York:${CALENDAR_EVENT.startLocal}`,
    `DTEND;TZID=America/New_York:${CALENDAR_EVENT.endLocal}`,
    CALENDAR_EVENT.recurrence,
    `SUMMARY:${CALENDAR_EVENT.title}`,
    `LOCATION:${CALENDAR_EVENT.location}`,
    `DESCRIPTION:${CALENDAR_EVENT.details}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
)}`;

const calendarLinks = [
  {
    label: "Apple / Outlook / ICS",
    href: icsHref,
    download: "samasangha-dances.ics",
  },
  {
    label: "Google",
    href: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CALENDAR_EVENT.title)}&dates=${CALENDAR_EVENT.startUtc}/${CALENDAR_EVENT.endUtc}&details=${encodeURIComponent(CALENDAR_EVENT.details)}&location=${encodeURIComponent(CALENDAR_EVENT.location)}&recur=${encodeURIComponent(CALENDAR_EVENT.recurrence)}`,
  },
  {
    label: "Outlook.com",
    href: `https://outlook.live.com/calendar/0/action/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(CALENDAR_EVENT.title)}&startdt=2026-06-20T19:30:00&enddt=2026-06-20T21:45:00&body=${encodeURIComponent(`${CALENDAR_EVENT.details} Recurs on the third Saturday of each month.`)}&location=${encodeURIComponent(CALENDAR_EVENT.location)}`,
  },
  {
    label: "Yahoo",
    href: `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(CALENDAR_EVENT.title)}&st=${CALENDAR_EVENT.startUtc}&dur=0215&desc=${encodeURIComponent(`${CALENDAR_EVENT.details} Recurs on the third Saturday of each month.`)}&in_loc=${encodeURIComponent(CALENDAR_EVENT.location)}`,
  },
];

export default function DancesPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      {/* ── Header ─────────────────────────────────────────────── */}
      <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>
        Monthly gathering
      </p>
      <h1
        className="font-serif mb-6"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)",
          fontWeight: 400,
          color: "var(--ink-900)",
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
        }}
      >
        Dances of Universal Peace
      </h1>
      <p className="text-lg leading-relaxed mb-10" style={{ color: "var(--fg2)" }}>
        Live Dances of Universal Peace in Cambridge, singing and moving together,
        we embrace the Unity at the heart of all paths to the Source.
      </p>

      {/* ── Hero image ─────────────────────────────────────────── */}
      <Image
        src="/assets/UDPcircle.png"
        alt="Dances of Universal Peace circle"
        width={1254}
        height={1254}
        className="mx-auto mb-12 h-auto w-full max-w-40 sm:max-w-48"
        priority
      />

      {/* ── Practice details card ──────────────────────────────── */}
      <div
        className="gold-shadow rounded-2xl overflow-hidden mb-14"
        style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)" }}
      >
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 p-7">
          {PRACTICE.map((row) => (
            <div key={row.dt}>
              <dt className="eyebrow mb-1" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>
                {row.dt}
              </dt>
              <dd className="font-medium" style={{ color: "var(--ink-900)" }}>
                {row.dd}
              </dd>
            </div>
          ))}
        </dl>
        <p className="px-7 pb-6 text-sm" style={{ color: "var(--fg2)" }}>
          Please arrive a few minutes early to allow for a smooth start. No experience
          required, only your presence.
        </p>
        <details className="px-7 pb-7">
          <summary
            className="inline-flex cursor-pointer list-none items-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
          >
            Add to calendar
          </summary>
          <div className="calendar-options mt-3 flex flex-wrap gap-2">
            {calendarLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                download={link.download}
                target={link.download ? undefined : "_blank"}
                rel={link.download ? undefined : "noopener noreferrer"}
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  border: "1px solid var(--surface-border)",
                  color: "var(--ink-800)",
                  background: "#fff",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </details>
      </div>

      {/* ── About the practice ─────────────────────────────────── */}
      <div className="prose prose-stone max-w-none leading-relaxed">
        <p>
          The Dances of Universal Peace are part of the timeless tradition of body
          prayer and sacred dance. Drawing on the sacred phrases, scripture, and
          poetry of the many spiritual traditions of the earth, the Dances blend
          chant, live music, and evocative movement into a living experience of
          unity, peace, and integration.
        </p>
        <p>
          Spiritual practice brings us face to face with Life and Truth, prior to the
          concepts and beliefs of the person, opening to our true nature, authentic,
          unguarded, beyond form, and imbued with the spaciousness and love that
          connects all. This taste of our true nature, as Universal Peace, opens to the
          possibility of a deep spiritual revolution within the person.
        </p>
        <blockquote>
          One Heart, One People, One Unity.
          <br />
          May all beings be happy and free.
        </blockquote>
        <p style={{ color: "var(--fg3)" }}>
          The Dances of Universal Peace are held in trust by the Sufi Ruhaniat
          International for the benefit of all people.
        </p>
      </div>

      {/* ── Footer links ───────────────────────────────────────── */}
      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/deepen/music/albums/original-dances"
          className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm"
          style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
        >
          Listen to the dances →
        </Link>
        <Link
          href="/deepen?type=articles"
          className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm"
          style={{ border: "1px solid var(--surface-border)", color: "var(--ink-800)" }}
        >
          Articles & interviews
        </Link>
      </div>
    </div>
  );
}
