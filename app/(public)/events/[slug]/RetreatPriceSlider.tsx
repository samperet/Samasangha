"use client";

import { useState } from "react";

const DONATE_BASE = "https://www.paypal.com/donate/?hosted_button_id=77ADFBGTTU2QE";

interface Props {
  priceMin: number; // cents
  priceMax: number; // cents
  note?: string; // e.g. "Early-bird pricing until July 1, 2026"
}

export default function RetreatPriceSlider({ priceMin, priceMax, note }: Props) {
  const min  = Math.round(priceMin / 100);
  const max  = Math.round(priceMax / 100);
  const mid  = Math.round((min + max) / 2);

  const [amount, setAmount] = useState(mid);

  const pct = max > min ? ((amount - min) / (max - min)) * 100 : 50;

  function handleDonate() {
    window.open(`${DONATE_BASE}&amount=${amount}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <h2 className="font-serif mb-1" style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}>
        Register for this retreat
      </h2>
      <p className="text-sm mb-2" style={{ color: "var(--fg2)" }}>
        This retreat operates on a sliding scale. Choose the amount that feels right for you.
      </p>
      {note && (
        <p
          className="text-xs font-semibold mb-4 inline-block px-2.5 py-1 rounded-full"
          style={{ background: "var(--gold-100)", color: "var(--gold-700)" }}
        >
          {note}
        </p>
      )}
      <div className="mb-4" />

      {/* Amount display */}
      <div className="text-center mb-5">
        <span
          className="font-serif"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 500, color: "var(--gold-700)" }}
        >
          ${amount}
        </span>
        <p className="text-xs mt-1" style={{ color: "var(--fg3)" }}>
          ${min}, ${max} sliding scale
        </p>
      </div>

      {/* Slider */}
      <div className="relative mb-7" style={{ padding: "0 2px" }}>
        <div
          className="absolute top-1/2 left-0 right-0 h-1.5 rounded-full"
          style={{
            transform: "translateY(-50%)",
            background: `linear-gradient(to right, var(--gold-500) ${pct}%, var(--parch-200) ${pct}%)`,
            pointerEvents: "none",
          }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            position: "relative",
            width: "100%",
            appearance: "none",
            WebkitAppearance: "none",
            background: "transparent",
            height: "24px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between text-xs mb-7" style={{ color: "var(--fg3)" }}>
        <span>${min}</span>
        <span style={{ color: "var(--gold-600)", fontWeight: 500 }}>${mid} suggested</span>
        <span>${max}</span>
      </div>

      <button
        onClick={handleDonate}
        className="w-full font-semibold py-3 rounded-lg text-sm transition-all duration-200"
        style={{ background: "var(--gold-600)", color: "var(--fg-on-gold)", boxShadow: "var(--shadow-sm)" }}
      >
        Donate ${amount} &amp; Register →
      </button>
    </div>
  );
}
