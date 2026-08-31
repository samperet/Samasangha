import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Murshids Halima and Abraham" };

// Their own combined bio, in the plural voice, exactly as they wrote it on
// northeastsufis.org/abraham-halima-sussman. It lives here rather than in the
// Teacher.bio column because it belongs to the pair, not to either record.
const BIO = [
  "Murshida Halima and Murshid Abraham Sussman are senior mentor teachers in the Sufi Ruhaniat and Dances of Universal Peace lineages, inspired musicians, and experienced guides in the path of the awakening heart. They share joy and clarity arising from their own practice and tap a depth that arises from a lifetime of integrating spiritual practice, psychological exploration, and a love of the natural world. They travel and teach internationally, returning home to Massachusetts, local family, and sangha.",
  "Halima seeded her love of the Sufi path in Murshid Sam’s Marin Dance Meeting.",
  "Abraham is an original mureed of Murshid Sam.",
];

const PORTRAITS = [
  { src: "/assets/lineage/halima-sussman.gif", alt: "Murshida Halima Sussman" },
  { src: "/assets/lineage/abraham-sussman.png", alt: "Murshid Abraham Sussman" },
];

export default function MurshidsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/welcome"
        className="text-sm transition-colors mb-10 inline-block"
        style={{ color: "var(--fg3)" }}
      >
        ← Welcome
      </Link>

      {/* ── Hero: the two portraits together, then the name block ── */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-10">
        <div className="flex gap-3 shrink-0">
          {PORTRAITS.map((p) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              className="rounded-2xl object-cover object-top"
              style={{
                width: 150,
                border: "3px solid var(--gold-300)",
                background: "var(--parch-100)",
              }}
            />
          ))}
        </div>
        <div className="text-center sm:text-left sm:pt-3">
          <p className="eyebrow mb-2" style={{ fontSize: "0.7rem", color: "var(--gold-600)" }}>
            Murshids · SamaSangha
          </p>
          <h1
            className="font-serif leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 2.7rem)", fontWeight: 500, color: "var(--ink-900)" }}
          >
            Murshids Halima and Abraham
          </h1>
        </div>
      </div>

      {/* Rose flourish */}
      <div className="flex justify-center mb-10" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/decorative-line.png" alt="" className="h-5 w-auto opacity-70" />
      </div>

      <div className="prose prose-stone max-w-none leading-relaxed">
        {BIO.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
      </div>
    </div>
  );
}
