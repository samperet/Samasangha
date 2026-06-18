import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import LokaWidgetRecorder from "./LokaWidgetRecorder";
import { GOAL_VOICES } from "./loka-shared";

export const metadata: Metadata = {
  title: "Loka Samastah",
  description:
    "Add your voice to a collective prayer, Lokah Samastah Sukhino Bhavantu, may all beings everywhere be happy and free. Together we are gathering 108 voices.",
};

export const dynamic = "force-dynamic";

// Georgia + Helvetica, scoped to this page. Overriding the font CSS variables
// on the wrapper cascades into the singalong widget and recorder below.
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
        <p className="font-serif italic mx-auto mb-4" style={{ fontSize: "1.3rem", color: "var(--ink-800)", maxWidth: "30ch" }}>
          May all beings everywhere be happy and free.
        </p>
        <p className="mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "var(--fg2)", maxWidth: "40ch" }}>
          We are gathering <strong>108 voices</strong>, one for each bead of a mala, to sing this
          blessing together.
        </p>
      </header>

      <LokaWidgetRecorder count={count} goal={goal} pct={pct} />
    </div>
  );
}
