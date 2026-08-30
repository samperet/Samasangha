"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type CardId = "practice" | "dances";
const ALL: CardId[] = ["practice", "dances"];

/**
 * The two regular-gathering cards.
 *
 * Side by side (lg and up) they expand together, so neither is left stranded at
 * a different height. Stacked on a phone that behaviour is unhelpful — opening
 * one would push a wall of text between you and the other — so there each card
 * opens on its own.
 */
export default function GatheringCards() {
  const [openIds, setOpenIds] = useState<CardId[]>([]);
  const [sideBySide, setSideBySide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // matches lg:grid-cols-2
    const sync = () => {
      setSideBySide(mq.matches);
      // Growing into the side-by-side layout with one open: open both, so the
      // pair stays level.
      if (mq.matches) setOpenIds((prev) => (prev.length ? ALL : prev));
    };
    const raf = requestAnimationFrame(sync);
    mq.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
    };
  }, []);

  const toggle = (id: CardId) =>
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (sideBySide) return isOpen ? [] : ALL;
      return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
    });

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-x-6 gap-y-28 lg:gap-y-6 items-stretch">
      <Card
        image="/assets/TuesdayPractice.png"
        imageAlt="Weekly Zoom Practice, people in a circle"
        title="Weekly Zoom Practice"
        bodyId="gathering-practice"
        open={openIds.includes("practice")}
        onToggle={() => toggle("practice")}
      >
        <p className="leading-relaxed mb-3" style={{ color: "var(--fg2)" }}>
          Every Tuesday morning Abraham, Halima, and the Sama Sangha gather online for
          Sufi practice and meditation, zikr, breath, and heart awakening. All are welcome.
        </p>
        <p className="leading-relaxed" style={{ color: "var(--fg2)" }}>
          Our intentions are toward 7 generations, toward Peace on Earth. Practice is free,
          supported by dana.
        </p>
        <Facts
          items={[
            ["When", "Every Tuesday, 9 AM EST", true],
            [
              "Where",
              <>
                Online via Zoom —{" "}
                <Link href="/contact" className="underline underline-offset-2" style={{ color: "var(--link)" }}>
                  email us for the link
                </Link>
              </>,
              true,
            ],
            ["Cost", "Free, dana welcome", false],
            ["Open to", "All, no experience needed", false],
          ]}
        />
        <div className="mt-auto pt-5 flex justify-center">
          <a
            href="https://wordpress.us2.list-manage.com/subscribe?u=dbca5f3f5422b598395d3eaa1&id=b9cee861d5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-semibold px-6 py-2.5 rounded-lg"
            style={{ background: "#3a8db7", color: "#ffffff", boxShadow: "var(--shadow-sm)" }}
          >
            Join our Newsletter →
          </a>
        </div>
      </Card>

      <Card
        image="/assets/UDPcircle.png"
        imageAlt="Dances of Universal Peace circle"
        title="Dances of Universal Peace"
        bodyId="gathering-dances"
        open={openIds.includes("dances")}
        onToggle={() => toggle("dances")}
      >
        <p className="leading-relaxed mb-3" style={{ color: "var(--fg2)" }}>
          Sacred circle dances drawing from the spiritual traditions of the world, Hindu,
          Buddhist, Sufi, Christian, Jewish, and Indigenous. Singing and moving together,
          we embrace the unity at the heart of all paths.
        </p>
        <p className="leading-relaxed" style={{ color: "var(--fg2)" }}>
          The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International
          for the benefit of all people. No experience required, only your presence.
        </p>
        <Facts
          items={[
            ["When", "Third Saturday · 7:30–9:45 PM", true],
            ["Where", "Friends Meeting House, 5 Longfellow Park, Cambridge (near Harvard Square)", true],
            ["Contribution", "$10–15 kindly requested", false],
            ["Led by", "SamaSangha with Halima, Abraham & Friends", false],
          ]}
        />
        <div className="mt-auto pt-5 flex justify-center">
          <Link
            href="/dances"
            className="inline-block font-semibold px-6 py-2.5 rounded-lg"
            style={{ background: "#3a8db7", color: "#ffffff", boxShadow: "var(--shadow-sm)" }}
          >
            About the Dances →
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Card({
  image,
  imageAlt,
  title,
  bodyId,
  open,
  onToggle,
  children,
}: {
  image: string;
  imageAlt: string;
  title: string;
  bodyId: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="gold-shadow rounded-2xl relative h-full flex flex-col"
      style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)" }}
    >
      {/* Highlight image, protruding above the top of the card */}
      <div className="flex justify-center">
        <Image
          src={image}
          alt={imageAlt}
          width={200}
          height={200}
          className="rounded-2xl"
          style={{ marginTop: "-6rem" }}
        />
      </div>
      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 flex-1 flex flex-col">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="w-full cursor-pointer select-none"
        >
          <h2
            className="font-serif text-center"
            style={{
              fontSize: "clamp(1.5rem, 3.4vw, 2.05rem)",
              fontWeight: 400,
              color: "var(--ink-900)",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h2>
          <span
            className="mt-2 flex items-center justify-center gap-1.5"
            style={{ color: "var(--gold-700)" }}
          >
            <span className="eyebrow" style={{ fontSize: "0.72rem" }}>
              {open ? "Hide details" : "Show details"}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "none" }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {/* Only carry the flex classes while open — a `display:flex` utility
            would otherwise beat the `hidden` attribute and never collapse. */}
        <div id={bodyId} hidden={!open} className={open ? "pt-5 flex-1 flex flex-col" : "pt-5"}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Facts({ items }: { items: [string, React.ReactNode, boolean][] }) {
  return (
    <dl
      className="grid grid-cols-2 gap-x-6 gap-y-3 pt-5 mt-5"
      style={{ borderTop: "1px solid var(--surface-border)" }}
    >
      {items.map(([term, value, strong]) => (
        <div key={term}>
          <dt className="eyebrow mb-0.5" style={{ fontSize: "0.68rem", color: "var(--gold-600)" }}>
            {term}
          </dt>
          <dd
            className={strong ? "font-medium" : undefined}
            style={{ color: strong ? "var(--ink-900)" : "var(--fg2)" }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
