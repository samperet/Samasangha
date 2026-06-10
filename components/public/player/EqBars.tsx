export default function EqBars({ paused = false }: { paused?: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-3.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-sm bg-gold-600"
          style={{
            animationDelay: `${i * 0.18}s`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      ))}
    </span>
  );
}
