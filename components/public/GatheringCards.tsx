import Image from "next/image";
import Link from "next/link";

/**
 * The two regular-gathering cards. Each is a link straight through to its own
 * page, which carries the full schedule, venue and practical detail — the
 * cards used to expand in place, which meant the same information lived in two
 * places and pushed the second card down the screen on a phone.
 */
const GATHERINGS = [
  {
    href: "/teachings/tuesday-practice",
    image: "/assets/TuesdayPractice.png",
    imageAlt: "Weekly Zoom Practice, people in a circle",
    title: "Weekly Zoom Practice",
    summary:
      "Every Tuesday morning at 9 AM, online — Sufi practice and meditation, zikr, breath and heart awakening. All are welcome.",
    cue: "About the practice",
  },
  {
    href: "/dances",
    image: "/assets/UDPcircle.png",
    imageAlt: "Dances of Universal Peace circle",
    title: "Dances of Universal Peace",
    summary:
      "Third Saturday of the month in Cambridge — sacred circle dances drawing from the spiritual traditions of the world. No experience required.",
    cue: "About the Dances",
  },
];

export default function GatheringCards() {
  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
      {GATHERINGS.map((g) => (
        <Link
          key={g.href}
          href={g.href}
          className="gathering-card group rounded-2xl relative h-full flex flex-col"
          style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)" }}
        >
          {/* Highlight image, sitting wholly inside the card */}
          <div className="flex justify-center pt-7 sm:pt-8">
            <Image
              src={g.image}
              alt={g.imageAlt}
              width={200}
              height={200}
              className="rounded-2xl"
            />
          </div>

          <div className="px-6 sm:px-7 pb-7 sm:pb-8 pt-5 flex-1 flex flex-col text-center">
            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.05rem)",
                fontWeight: 400,
                color: "var(--ink-900)",
                lineHeight: 1.15,
              }}
            >
              {g.title}
            </h2>

            <p className="leading-relaxed mt-3" style={{ color: "var(--fg2)" }}>
              {g.summary}
            </p>

            <span
              className="mt-auto pt-5 inline-flex items-center justify-center gap-1.5 font-semibold"
              style={{ color: "var(--link)" }}
            >
              {g.cue}
              <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
