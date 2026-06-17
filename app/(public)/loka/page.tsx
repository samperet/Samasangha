import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LokaStudio from "./LokaStudio";
import { GOAL_VOICES } from "./loka-shared";

export const metadata: Metadata = {
  title: "Loka Samastah",
  description:
    "Add your voice to a collective prayer, Lokah Samastah Sukhino Bhavantu, may all beings everywhere be happy and free. Together we are gathering 108 voices.",
};

export const dynamic = "force-dynamic";

export default async function LokaPage() {
  const count = await prisma.lokaRecording.count({ where: { approved: true } }).catch(() => 0);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      {/* Mission */}
      <header className="text-center mb-10">
        <p className="eyebrow mb-3" style={{ color: "var(--fg3)", fontSize: "0.8rem" }}>
          A prayer you can sing
        </p>
        <h1
          className="font-serif mb-5 leading-tight"
          style={{ fontSize: "clamp(2.2rem, 6vw, 3rem)", fontWeight: 500, color: "var(--ink-900)" }}
        >
          Lokah Samastah
          <br />
          Sukhino Bhavantu
        </h1>
        <p className="font-serif italic mx-auto mb-6" style={{ fontSize: "1.3rem", color: "var(--ink-800)", maxWidth: "30ch" }}>
          May all beings everywhere be happy and free.
        </p>

        <div
          className="rounded-2xl p-6 text-left mx-auto"
          style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)", maxWidth: "34rem" }}
        >
          <p className="mb-3" style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg1)" }}>
            We are gathering <strong>108 voices</strong> — one for each bead of a mala — to sing
            this blessing together.
          </p>
          <p className="mb-3" style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg1)" }}>
            It costs nothing. It takes only a few minutes. Think of it as a small prayer you
            leave for the world.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg1)" }}>
            When the voices are gathered, they become a living{" "}
            <strong>prayer wheel</strong> that sings as one — and you can turn it whenever your
            heart needs it.
          </p>
        </div>
      </header>

      <LokaStudio backingUrl="/api/loka/backing" initialCount={count} goal={GOAL_VOICES} />
    </div>
  );
}
