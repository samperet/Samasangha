import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import LokaStudio from "./LokaStudio";
import { GOAL_VOICES } from "./loka-shared";

export const metadata: Metadata = {
  title: "Loka Samastah",
  description:
    "Add your voice to a collective prayer, Lokah Samastah Sukhino Bhavantu, may all beings everywhere be happy and free. Together we are gathering 108 voices.",
};

export const dynamic = "force-dynamic";

// Georgia + Helvetica, scoped to this page. Overriding the font CSS variables
// on the wrapper cascades to the studio, recorder, and prayer wheel below.
const lokaFonts: CSSProperties = {
  ["--font-serif" as string]: "Georgia, 'Times New Roman', serif",
  ["--font-sans" as string]: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
  fontFamily: "var(--font-sans)",
};

export default async function LokaPage() {
  const count = await prisma.lokaRecording.count({ where: { approved: true } }).catch(() => 0);
  const goal = GOAL_VOICES;
  const pct = Math.max(0, Math.min(100, Math.round((count / goal) * 100)));

  return (
    <div className="max-w-2xl mx-auto px-5 py-12" style={lokaFonts}>
      {/* Mission */}
      <header className="text-center mb-9">
        <h1
          className="font-serif mb-5 leading-tight"
          style={{ fontSize: "clamp(2.2rem, 6vw, 3rem)", fontWeight: 600, color: "var(--ink-900)" }}
        >
          Lokah Samastah
          <br />
          Sukhino Bhavantu
        </h1>
        <p className="font-serif italic mx-auto" style={{ fontSize: "1.3rem", color: "var(--ink-800)", maxWidth: "30ch" }}>
          May all beings everywhere be happy and free.
        </p>
      </header>

      {/* Thermometer of gathered voices */}
      <section
        className="rounded-2xl p-6 mb-7 mx-auto"
        style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)", maxWidth: "34rem" }}
      >
        <div className="flex items-baseline justify-between mb-2.5">
          <span style={{ fontSize: "0.95rem", color: "var(--fg2)" }}>Voices gathered</span>
          <span style={{ fontSize: "1.05rem", color: "var(--fg2)" }}>
            <strong style={{ color: "var(--ink-900)", fontSize: "1.4rem" }}>{count}</strong> / {goal}
          </span>
        </div>
        <div
          className="h-5 rounded-full overflow-hidden"
          style={{ background: "var(--parch-200)" }}
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`${count} of ${goal} voices gathered`}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: "var(--gold-600)", transition: "width .6s ease" }}
          />
        </div>
        <p className="text-center mt-3" style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--fg2)" }}>
          We are gathering <strong>108 voices</strong>, one for each bead of a mala, to sing this
          blessing together.
        </p>
      </section>

      {/* Listen to the song first */}
      <section
        className="rounded-2xl p-6 mb-9 mx-auto"
        style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)", maxWidth: "34rem" }}
      >
        <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--ink-900)" }}>
          Listen to the song first
        </h2>
        <p className="mb-4" style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--fg1)" }}>
          Before you add your voice, take a few minutes to listen all the way through. Put on
          headphones, let the melody settle in, and hum along quietly until it feels familiar.
          There is no wrong way to do this.
        </p>
        <audio controls preload="none" src="/api/loka/backing" className="w-full" style={{ maxWidth: "100%" }}>
          Your browser can&apos;t play the song. Please try another browser.
        </audio>
      </section>

      <LokaStudio backingUrl="/api/loka/backing" initialCount={count} goal={GOAL_VOICES} />
    </div>
  );
}
