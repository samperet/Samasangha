// Static invocation with the calligraphy winged-heart above it.
// (Previously a multi-language scroll carousel; reverted to English only.)

const INVOCATION =
  "Towards the One, the Perfection of Love, Harmony and Beauty, the Only Being, united with all the Illuminated Souls who form the Embodiment of the Master, the Spirit of Guidance.";

const TEXT_BLUE = "#1b7187";

export default function InvocationCarousel() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: "100%", paddingTop: "clamp(12px, 4vh, 56px)", paddingBottom: "clamp(12px, 4vh, 56px)", gap: "clamp(16px, 3vh, 36px)" }}
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
          width: "min(520px, 80%)",
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
          fontSize: "clamp(1.65rem, 3.7vw, 2.85rem)",
          lineHeight: 1.5,
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
