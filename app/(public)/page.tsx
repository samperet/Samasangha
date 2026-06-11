import Link from "next/link";
import InvocationCarousel from "@/components/public/InvocationCarousel";
import CommunityCollage from "@/components/public/CommunityCollage";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";

export const revalidate = 60;

async function getUpcomingRetreats() {
  try {
    return await prisma.event.findMany({
      where: { published: true, isRetreat: true, startDate: { gt: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

function GoldRule() {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden>
      <span style={{ width: 56, height: 1, background: "var(--gold-500)", opacity: 0.5, display: "block" }} />
      <span style={{ color: "var(--gold-500)", fontSize: "0.85rem", opacity: 0.75 }}>✦</span>
      <span style={{ width: 56, height: 1, background: "var(--gold-500)", opacity: 0.5, display: "block" }} />
    </div>
  );
}

export default async function HomePage() {
  const retreats = await getUpcomingRetreats();

  return (
    <>
      {/* ── 100vh masthead — homepage only ────────────────────────── */}
      <div
        className="relative flex items-center justify-center overflow-hidden px-5"
        style={{
          // Header chrome is now heart banner (~120px) + sticky menu (~75px)
          height: "calc(100vh - 200px)",
          minHeight: 420,
          background: "radial-gradient(120% 80% at 50% -10%, var(--parch-100) 0%, var(--parch-50) 60%)",
        }}
      >
        {/* Gold halo */}
        <div
          aria-hidden
          style={{
            position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
            width: "min(680px, 90vw)", height: "560px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,164,54,0.20) 0%, rgba(217,164,54,0) 62%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative w-full" style={{ maxWidth: "min(94vw, 1280px)" }}>
          <InvocationCarousel />
        </div>
      </div>

      {/* ── About us ───────────────────────────────────────────── */}
      <section
        role="region"
        aria-label="About SamaSangha"
        className="relative py-14 px-5 text-center overflow-hidden"
        style={{
          backgroundImage: "url('/assets/lotus-background-sama3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* Section 2: center card flanked by community photos. Click a photo
            to open the lightbox (handled by CommunityCollage). */}
        <CommunityCollage>
          {/* Combined card: image on top (top corners rounded), text below
              (bottom corners rounded). overflow-hidden unifies them into one. */}
          <div
            className="w-full shrink-0 rounded-2xl overflow-hidden"
            style={{ maxWidth: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
          >
            <Image
              src="/assets/AHHA.png"
              alt="Abraham and Halima"
              width={480}
              height={320}
              className="block w-full"
            />
            <blockquote
              className="font-serif not-italic text-center"
              style={{
                fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "var(--ink-900)",
                padding: "1.75rem 2rem",
                margin: 0,
                background: "rgba(255,255,255,0.97)",
                borderLeft: "none",
              }}
            >
              SamaSangha is the community of seekers who have gathered in Massachusetts, and also
              far and wide, with the guidance of Sufi Murshids Halima and Abraham.
            </blockquote>
          </div>
        </CommunityCollage>
      </section>

      {/* ── Tuesday Practice & Dances — side by side when they fit ── */}
      <section
        role="region"
        aria-label="Regular gatherings"
        className="py-16 md:py-20 px-5"
        style={{ background: "var(--parch-100)", borderTop: "1px solid var(--surface-border)", borderBottom: "1px solid var(--surface-border)" }}
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
          >
            <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
            <div className="p-7">
              {/* Text + image in one row */}
              <div className="flex gap-6 items-start mb-5">
                <div className="flex-1 min-w-0">
                  <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Weekly practice</p>
                  <h2 className="font-serif mb-4" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.15 }}>
                    Tuesday Practice
                  </h2>
                  <p className="leading-relaxed mb-3 text-sm" style={{ color: "var(--fg2)" }}>
                    Every Tuesday morning Abraham, Halima, and the Sama Sangha gather online for
                    Sufi practice and meditation — zikr, breath, and heart awakening. All are welcome.
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: "var(--fg2)" }}>
                    Our intentions are toward 7 generations, toward Peace on Earth. Practice is free,
                    supported by dana.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <Image
                    src="/assets/TuesdayPractice.png"
                    alt="Tuesday Practice — people in a circle"
                    width={140}
                    height={140}
                    className="rounded-xl"
                  />
                  <Link
                    href="/teachings/tuesday-practice"
                    className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm"
                    style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
                  >
                    Join Tuesday Practice →
                  </Link>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-5" style={{ borderTop: "1px solid var(--surface-border)" }}>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>When</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Every Tuesday, 9 AM EST</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Where</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Online via Zoom</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Cost</dt>
                  <dd style={{ color: "var(--fg2)" }}>Free — dana welcome</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Open to</dt>
                  <dd style={{ color: "var(--fg2)" }}>All, no experience needed</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Cambridge Dances of Universal Peace */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
          >
            <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
            <div className="p-7">
              {/* Text + image in one row */}
              <div className="flex gap-6 items-start mb-5">
                <div className="flex-1 min-w-0">
                  <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Monthly gathering</p>
                  <h2 className="font-serif mb-4" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.15 }}>
                    Dances of Universal Peace
                  </h2>
                  <p className="leading-relaxed mb-3 text-sm" style={{ color: "var(--fg2)" }}>
                    Sacred circle dances drawing from the spiritual traditions of the world — Hindu,
                    Buddhist, Sufi, Christian, Jewish, and Indigenous. Singing and moving together,
                    we embrace the unity at the heart of all paths.
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: "var(--fg2)" }}>
                    The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International
                    for the benefit of all people. No experience required — only your presence.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <Image
                    src="/assets/UDPcircle.png"
                    alt="Dances of Universal Peace circle"
                    width={140}
                    height={140}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-5" style={{ borderTop: "1px solid var(--surface-border)" }}>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>When</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Third Saturday · 7:30–9:45 PM</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Where</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Friends Meeting House, Cambridge</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Contribution</dt>
                  <dd style={{ color: "var(--fg2)" }}>$10–15 suggested</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Led by</dt>
                  <dd style={{ color: "var(--fg2)" }}>Abraham, Halima & Friends</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Retreats ───────────────────────────────────── */}
      <section
        role="region"
        aria-label="Upcoming retreats"
        className="py-16 md:py-20 px-5"
        style={{ background: "var(--parch-100)", borderTop: "1px solid var(--surface-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-2">Gatherings</p>
            <h2 className="font-serif" style={{ fontSize: "2.25rem", fontWeight: 500, color: "var(--ink-900)" }}>
              Upcoming retreats
            </h2>
          </div>

          {retreats.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "var(--fg2)" }}>
              No upcoming retreats scheduled.{" "}
              <Link href="/contact" className="underline underline-offset-2" style={{ color: "var(--crimson-700)" }}>
                Join the mailing list to be notified.
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {retreats.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[14px] overflow-hidden relative"
                  style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
                >
                  <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
                  <div className="px-7 py-6 flex flex-col sm:flex-row sm:items-start gap-5">
                    {event.isRetreat && (
                      <span
                        className="absolute top-5 right-6 text-xs font-semibold uppercase hidden sm:block"
                        style={{ letterSpacing: "0.14em", color: "var(--fg3)" }}
                      >
                        Retreat
                      </span>
                    )}
                    <div className="sm:w-44 shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--gold-700)" }}>
                        {formatDateRange(event.startDate, event.endDate)}
                      </p>
                      {(event.location || event.isOnline) && (
                        <p className="text-xs mt-1.5" style={{ color: "var(--fg2)" }}>
                          {event.isOnline ? "Online" : event.location}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-serif leading-snug mb-2 pr-20"
                        style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--ink-900)" }}
                      >
                        {event.title}
                      </h3>
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--fg2)" }}>
                        {event.description}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      {event.registerUrl && (
                        <a
                          href={event.registerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold px-5 py-2.5 rounded-lg whitespace-nowrap"
                          style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
                        >
                          Register
                        </a>
                      )}
                      {event.flyerUrl && (
                        <a
                          href={event.flyerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline underline-offset-2 whitespace-nowrap"
                          style={{ color: "var(--fg3)" }}
                        >
                          View flyer
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/events/upcoming"
              className="text-sm font-medium underline underline-offset-4"
              style={{ color: "var(--crimson-700)" }}
            >
              All upcoming events →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
