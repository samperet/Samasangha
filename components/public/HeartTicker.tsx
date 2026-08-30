// A single centred line of "HEART", repeated six times, as a quiet ribbon
// above the footer content.
const REPEAT = 6;

export default function HeartTicker() {
  return (
    <div className="overflow-hidden">
      <p
        aria-label="HEART"
        className="font-serif text-center"
        style={{
          color: "var(--gold-900)",
          opacity: 0.85,
          fontSize: "1.35rem",
          letterSpacing: "0.2em",
          whiteSpace: "nowrap",
        }}
      >
        {"HEART".repeat(REPEAT)}
      </p>
    </div>
  );
}
