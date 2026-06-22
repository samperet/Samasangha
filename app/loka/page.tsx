import type { Metadata } from "next";
import type { CSSProperties } from "react";
import LokaWidgetRecorder from "./LokaWidgetRecorder";

export const metadata: Metadata = {
  title: "Loka Samastah",
  description:
    "Add your voice to a collective prayer, Lokah Samastah Sukhino Bhavantu, may all beings everywhere be happy and free. Together we are gathering 108 voices.",
};

// Light blue / white theme + Georgia/Helvetica fonts, scoped to this page.
// Overriding the shared design tokens on the wrapper cascades into the page
// content and the singalong recorder below (both read these CSS variables).
const lokaTheme: CSSProperties = {
  ["--font-serif" as string]: "Georgia, 'Times New Roman', serif",
  ["--font-sans" as string]: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
  ["--ink-900" as string]: "#15335f",
  ["--ink-800" as string]: "#274a72",
  ["--ink-700" as string]: "#3f5e80",
  ["--fg1" as string]: "#15335f",
  ["--fg2" as string]: "#41607f",
  ["--fg3" as string]: "#7d93ad",
  ["--surface-border" as string]: "#d3e0f2",
  ["--parch-100" as string]: "#e9f1fc",
  ["--gold-700" as string]: "#1f4f8f",
  ["--gold-600" as string]: "#2f6fc0",
  ["--gold-500" as string]: "#4a8bd4",
  ["--gold-100" as string]: "#e1ecfa",
  ["--fg-on-gold" as string]: "#ffffff",
  ["--crimson-700" as string]: "#1d3f73",
  ["--fg-on-dark" as string]: "#ffffff",
  fontFamily: "var(--font-sans)",
  background: "#eef4fb",
  minHeight: "100vh",
};

export default function LokaPage() {
  return (
    <div style={lokaTheme}>
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-12">
        {/* Winged heart logo */}
        <div className="text-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/heart_wings_ancient_transparent.png"
            alt="Winged heart"
            className="mx-auto"
            style={{ width: "min(440px, 92%)", height: "auto" }}
          />
        </div>

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
          <p className="mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "var(--fg2)", maxWidth: "46ch" }}>
            This is a community project to collect <strong>108 voices</strong> to sing Loka Samastah,
            in the rendition of Halima Sussman. The end result will be an interactive prayer wheel,
            highlighting various groupings of voices. All voices and instruments welcome!
          </p>
        </header>

        <LokaWidgetRecorder />
      </div>
    </div>
  );
}
