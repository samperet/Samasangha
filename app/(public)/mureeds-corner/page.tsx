import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";
import DeepeningGate from "../deepen/deepening/DeepeningGate";

export const metadata: Metadata = { title: "Mureeds' Corner" };

// Links shown once the corner is unlocked
const LINKS = [
  {
    label: "Mureeds' Deepening",
    description: "The God is Breath study course and class materials.",
    href: "/deepen/deepening",
    external: false,
  },
  {
    label: "Elemental Breath",
    description: "An interactive practice for the breath of the elements.",
    href: "https://samperet.github.io/elementalbreath/",
    external: true,
  },
  {
    label: "Tuesday Practice Link (9AM EDT)",
    description: "Join the Tuesday morning practice gathering online.",
    href: "https://us02web.zoom.us/j/81957982405?pwd=UWFLNjZnY0hOMGJVWEV6MTkzaUFBdz09",
    external: true,
  },
  {
    label: "Mureed Directory",
    description: "Find one another, names, places, and ways to connect.",
    href: "/mureeds-corner/directory",
    external: false,
  },
];

export default async function MureedsCornerPage() {
  // Same gate as the Deepening page, unlock once with the class password
  // (admins pass through). Unlocking here also unlocks Deepening (shared cookie).
  const store = await cookies();
  const unlocked =
    (await verifyDeepeningToken(store.get(DEEPENING_COOKIE)?.value)) ||
    (await verifySessionToken(store.get(ADMIN_COOKIE)?.value));

  if (!unlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-stone-800 mb-10 text-center">
          Mureeds&rsquo; Corner
        </h1>
        <DeepeningGate />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className="text-center mb-4">
        <h1
          className="font-serif"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.1 }}
        >
          Mureeds&rsquo; Corner
        </h1>
      </div>

      <div className="flex justify-center mb-10" aria-hidden>
        <img src="/assets/decorative-line.png" alt="" className="h-6 w-auto" />
      </div>

      <div className="space-y-4">
        {LINKS.map((link) => {
          const inner = (
            <>
              <div className="flex-1">
                <p
                  className="font-serif mb-1 transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                  style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}
                >
                  {link.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                  {link.description}
                </p>
              </div>
              <span
                className="shrink-0 self-center text-lg transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: "var(--gold-600)" }}
                aria-hidden
              >
                {link.external ? "↗" : "→"}
              </span>
            </>
          );

          const className =
            "group flex items-start gap-4 rounded-2xl px-6 py-5 transition-shadow duration-200 hover:shadow-lg";
          const style = {
            background: "var(--parch-50)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--shadow-sm)",
            textDecoration: "none",
          } as React.CSSProperties;

          return link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
              {inner}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className={className} style={style}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
