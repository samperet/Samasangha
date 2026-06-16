// A static line of repeating "HEART" that clips to its container. Wider than
// the viewport so it reads as a continuous ribbon edge to edge.
const REPEAT = 200;

export default function HeartTicker() {
  return (
    <div className="overflow-hidden">
      <p
        aria-label="HEART"
        className="font-serif"
        style={{
          color: "var(--gold-400)",
          opacity: 0.75,
          fontSize: "0.95rem",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}
      >
        {"HEART".repeat(REPEAT)}
      </p>
    </div>
  );
}
