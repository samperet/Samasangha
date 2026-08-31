import Link from "next/link";

// Retreats that have been announced but aren't open yet: no registration, no
// details page and nothing to link to, so they appear as a note rather than as
// event records. Move each one into a real event once its details exist.
const SAVE_THE_DATE = [
  { title: "Dance Deepening", dates: "May 28 – 31, 2027" },
  { title: "Eat, Dance and Pray", dates: "July 29 – August 1, 2027" },
];

export default function SaveTheDate({ className = "" }: { className?: string }) {
  if (SAVE_THE_DATE.length === 0) return null;

  return (
    <div
      className={`rounded-[14px] px-7 py-6 ${className}`}
      style={{ background: "var(--bg-raised)", border: "1px dashed var(--gold-400)" }}
    >
      <p className="eyebrow mb-3 text-center" style={{ fontSize: "0.68rem", color: "var(--gold-700)" }}>
        Save the date · 2027
      </p>
      <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2">
        {SAVE_THE_DATE.map(({ title, dates }) => (
          <li key={title} className="text-center">
            <span className="font-serif" style={{ fontSize: "1.25rem", color: "var(--ink-900)" }}>
              {title}
            </span>
            <span className="block text-sm font-semibold" style={{ color: "var(--gold-700)" }}>
              {dates}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-sm" style={{ color: "var(--fg2)" }}>
        Details and registration to come.{" "}
        <Link href="/contact" className="underline underline-offset-2" style={{ color: "var(--link)" }}>
          Join the mailing list
        </Link>{" "}
        to hear first.
      </p>
    </div>
  );
}
