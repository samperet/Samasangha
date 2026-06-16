import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LokaStudio from "./LokaStudio";
import { BACKING_URL } from "./loka-shared";

export const metadata: Metadata = {
  title: "Sing Loka Samasta Together",
  description:
    "Add your voice to a collective recording of Lokah Samastah Sukhino Bhavantu, may all beings everywhere be happy and free.",
};

export default async function LokaPage() {
  // Backing track is the "Loka" chant from the Healing Love album.
  const track = await prisma.track
    .findFirst({
      where: {
        album: { slug: "healing-love" },
        title: { contains: "Loka", mode: "insensitive" },
        audioUrl: { not: null },
      },
      select: { audioUrl: true },
    })
    .catch(() => null);
  const backingUrl = track?.audioUrl || BACKING_URL;

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <header className="text-center mb-10">
        <p className="eyebrow mb-2" style={{ color: "var(--fg3)" }}>A collective prayer</p>
        <h1
          className="font-serif mb-4 leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 500, color: "var(--ink-900)" }}
        >
          Sing Loka Samasta together
        </h1>
        <p className="font-serif italic mx-auto" style={{ fontSize: "1.15rem", color: "var(--ink-800)", maxWidth: "44ch" }}>
          Lokah samastah sukhino bhavantu
        </p>
        <p className="text-sm mt-2 mx-auto" style={{ color: "var(--fg2)", maxWidth: "48ch" }}>
          May all beings everywhere be happy and free. Add your voice, then listen as the
          whole sangha sings as one.
        </p>
      </header>

      <LokaStudio backingUrl={backingUrl} />
    </div>
  );
}
