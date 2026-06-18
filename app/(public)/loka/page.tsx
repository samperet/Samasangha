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
        <p className="font-serif italic mx-auto" style={{ fontSize: "1.3rem", color: "var(--ink-800)", maxWidth: "30ch" }}>
          May all beings everywhere be happy and free.
        </p>
      </header>

      {/* Heart thermometer of gathered voices */}
      <section
        className="rounded-2xl p-6 mb-7 mx-auto text-center"
        style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)", maxWidth: "34rem" }}
      >
        <HeartThermometer count={count} goal={goal} pct={pct} />
        <p className="mt-1" style={{ fontSize: "1.05rem", color: "var(--fg2)" }}>
          <strong style={{ color: "var(--ink-900)", fontSize: "1.6rem" }}>{count}</strong>
          <span style={{ margin: "0 0.35rem" }}>/</span>
          {goal} voices gathered
        </p>
        <p className="mt-3" style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--fg2)" }}>
          We are gathering <strong>108 voices</strong>, one for each bead of a mala, to sing this
          blessing together.
        </p>
      </section>

      <LokaWidgetRecorder goal={GOAL_VOICES} />
    </div>
  );
}

// A heart that fills from the bottom like a thermometer, showing how many of the
// 108 voices have been gathered.
const HEART_PATH =
  "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4 c0,9.4,9.5,11.9,16,21.2c6.1-8.8,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z";

function HeartThermometer({ count, goal, pct }: { count: number; goal: number; pct: number }) {
  const H = 29.6;
  const fillH = (H * pct) / 100;
  const fillY = H - fillH;
  return (
    <svg
      viewBox="-2 -2 36 33.6"
      width="140"
      height="131"
      className="mx-auto block"
      role="img"
      aria-label={`${count} of ${goal} voices gathered`}
    >
      <defs>
        <clipPath id="loka-heart-clip">
          <path d={HEART_PATH} />
        </clipPath>
      </defs>
      {/* red vertical progress, filling from the bottom, clipped to the heart */}
      <rect x="0" y={fillY} width="32" height={fillH} fill="#e0282e" clipPath="url(#loka-heart-clip)" />
      {/* thin black outline */}
      <path d={HEART_PATH} fill="none" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
