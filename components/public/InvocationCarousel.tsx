// Static invocation with the calligraphy winged-heart above it.
// (Previously a multi-language scroll carousel; reverted to English only.)

const INVOCATION =
  "Towards the One, the Perfection of Love, Harmony and Beauty, the Only Being, united with all the Illuminated Souls who form the Embodiment of the Master, the Spirit of Guidance.";

// Darkened from #1b7187, which measured only ~4.0:1 against the masthead.
const TEXT_BLUE = "#124a5c";

export default function InvocationCarousel() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: "100%", paddingTop: "clamp(8px, 2vh, 24px)", paddingBottom: "clamp(8px, 2vh, 24px)", gap: "clamp(12px, 2vh, 22px)" }}
    >
      {/* Heading kept for SEO/structure, visually hidden and out of flow so
          it doesn't add space above the heart. */}
      <h1
        className="select-none"
        style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}
      >
        SamaSangha
      </h1>

      {/* Gold winged-heart calligraphy, above the invocation */}
      <img
        src="/assets/calligraphyheart.svg"
        alt=""
        aria-hidden
        style={{
          width: "min(430px, 72%)",
          maxWidth: "none",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(1.3rem, 2.9vw, 2.2rem)",
          lineHeight: 1.45,
          maxWidth: "100%",
          color: TEXT_BLUE,
          margin: 0,
          padding: "0 8px",
        }}
      >
        {INVOCATION}
      </p>
    </div>
  );
}
