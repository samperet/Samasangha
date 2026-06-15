// Static invocation with the calligraphy winged-heart behind it.
// (Previously a multi-language scroll carousel; reverted to English only.)

const INVOCATION =
  "Towards the One, the Perfection of Love, Harmony and Beauty, the Only Being, united with all the Illuminated Souls who form the Embodiment of the Master, the Spirit of Guidance.";

const TEXT_BLUE = "#1b7187";

export default function InvocationCarousel() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: "100%", paddingTop: "clamp(12px, 4vh, 56px)", paddingBottom: "clamp(12px, 4vh, 56px)", gap: 0 }}
    >
      {/* Heading kept for SEO/structure, visually hidden. */}
      <h1
        className="select-none"
        style={{ margin: 0, width: 96, height: 14, fontSize: 0, color: "transparent" }}
      >
        SamaSangha
      </h1>

      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "clamp(220px, 42vh, 380px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 8px",
        }}
      >
        {/* Gold winged-heart calligraphy, behind the invocation */}
        <img
          src="/assets/calligraphyheart.svg"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(1100px, 130%)",
            maxWidth: "none",
            opacity: 0.22,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        />

        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(1.65rem, 3.7vw, 2.85rem)",
            lineHeight: 1.5,
            maxWidth: "100%",
            color: TEXT_BLUE,
            margin: 0,
          }}
        >
          {INVOCATION}
        </p>
      </div>
    </div>
  );
}
