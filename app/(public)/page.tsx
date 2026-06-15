import Link from "next/link";
import InvocationCarousel from "@/components/public/InvocationCarousel";
import CommunityCollage from "@/components/public/CommunityCollage";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";

export const revalidate = 60;

async function getUpcomingEvents() {
  try {
    return await prisma.event.findMany({
      where: { published: true, startDate: { gt: new Date() } },
      orderBy: { startDate: "asc" },
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
  const events = await getUpcomingEvents();

  return (
    <>
      {/* ── 100vh masthead, homepage only ────────────────────────── */}
      <div
        className="relative flex items-center justify-center overflow-hidden px-5"
        style={{
          // Header chrome is now heart banner (~120px) + sticky menu (~75px)
          height: "calc(100vh - 200px)",
          minHeight: 420,
          // Sunlit-forest photo behind a light parchment wash; the wider white
          // splash (below) keeps the invocation clearly readable.
          backgroundColor: "var(--parch-50)",
          backgroundImage:
            "linear-gradient(rgba(251,247,236,0.42), rgba(251,247,236,0.55)), url('/assets/ForestIllumination.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Readability scrim behind the text, a soft parchment veil with a
            long gradual fade so the edges dissolve rather than reading as a
            defined shape. */}
        <div
          aria-hidden
          style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "min(1500px, 100vw)", height: "min(720px, 90%)",
            background:
              "radial-gradient(ellipse at center, rgba(251,247,236,0.82) 0%, rgba(251,247,236,0.7) 28%, rgba(251,247,236,0.45) 50%, rgba(251,247,236,0.18) 70%, rgba(251,247,236,0) 90%)",
            // Feather the top and bottom so the scrim has no hard border there.
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

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

      {/* ── Tuesday Practice & Dances, side by side when they fit ── */}
      <section
        role="region"
        aria-label="Regular gatherings"
        className="py-16 md:py-20 px-5"
        style={{ background: "var(--parch-100)", borderTop: "1px solid var(--surface-border)", borderBottom: "1px solid var(--surface-border)" }}
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          <div
            className="gold-shadow rounded-2xl overflow-hidden"
            style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)" }}
          >
            <div className="p-6 sm:p-7">
              {/* Text + image — stacked on mobile, side by side once there's room */}
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 sm:items-start mb-5">
                <div className="flex-1 min-w-0">
                  <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Weekly practice</p>
                  <h2 className="font-serif mb-4" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.15 }}>
                    Tuesday Practice
                  </h2>
                  <p className="leading-relaxed mb-3 text-sm" style={{ color: "var(--fg2)" }}>
                    Every Tuesday morning Abraham, Halima, and the Sama Sangha gather online for
                    Sufi practice and meditation, zikr, breath, and heart awakening. All are welcome.
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: "var(--fg2)" }}>
                    Our intentions are toward 7 generations, toward Peace on Earth. Practice is free,
                    supported by dana.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <Image
                    src="/assets/TuesdayPractice.png"
                    alt="Tuesday Practice, people in a circle"
                    width={140}
                    height={140}
                    className="rounded-xl"
                  />
                  <a
                    href="https://wordpress.us2.list-manage.com/subscribe?u=dbca5f3f5422b598395d3eaa1&id=b9cee861d5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm"
                    style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
                  >
                    Join our Newsletter →
                  </a>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-5" style={{ borderTop: "1px solid var(--surface-border)" }}>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>When</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Every Tuesday, 9 AM EST</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Where</dt>
                  <dd className="font-medium" style={{ color: "var(--ink-900)" }}>Online via Zoom, link sent via newsletter</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-0.5" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>Cost</dt>
                  <dd style={{ color: "var(--fg2)" }}>Free, dana welcome</dd>
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
            className="gold-shadow rounded-2xl overflow-hidden"
            style={{ background: "var(--parch-50)", border: "1px solid var(--surface-border)" }}
          >
            <div className="p-6 sm:p-7">
              {/* Text + image — stacked on mobile, side by side once there's room */}
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 sm:items-start mb-5">
                <div className="flex-1 min-w-0">
                  <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Monthly gathering</p>
                  <h2 className="font-serif mb-4" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.15 }}>
                    Dances of Universal Peace
                  </h2>
                  <p className="leading-relaxed mb-3 text-sm" style={{ color: "var(--fg2)" }}>
                    Sacred circle dances drawing from the spiritual traditions of the world, Hindu,
                    Buddhist, Sufi, Christian, Jewish, and Indigenous. Singing and moving together,
                    we embrace the unity at the heart of all paths.
                  </p>
                  <p className="leading-relaxed text-sm" style={{ color: "var(--fg2)" }}>
                    The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International
                    for the benefit of all people. No experience required, only your presence.
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
                  <Link
                    href="/dances"
                    className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm"
                    style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
                  >
                    About the Dances →
                  </Link>
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

      {/* ── Retreats ────────────────────────────────────────────── */}
      <section
        role="region"
        aria-label="Retreats"
        className="py-16 md:py-20 px-5"
        style={{ background: "var(--parch-100)", borderTop: "1px solid var(--surface-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2
              className="font-serif"
              style={{ fontSize: "2.25rem", fontWeight: 500, color: "var(--ink-900)", textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              Retreats
            </h2>
          </div>

          {events.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "var(--fg2)" }}>
              No upcoming events scheduled.{" "}
              <Link href="/contact" className="underline underline-offset-2" style={{ color: "var(--crimson-700)" }}>
                Join the mailing list to be notified.
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="gold-shadow group block rounded-[14px] overflow-hidden relative"
                  style={{ background: "#fff", border: "1px solid var(--surface-border)" }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {event.featuredImageUrl && (
                      <img
                        src={event.featuredImageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover sm:h-auto sm:w-60 sm:shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 px-7 py-6">
                      <p className="text-sm font-semibold mb-1" style={{ color: "var(--gold-700)" }}>
                        {formatDateRange(event.startDate, event.endDate)}
                        {(event.location || event.isOnline) && (
                          <span className="font-normal" style={{ color: "var(--fg2)" }}>
                            {"  ·  "}{event.isOnline ? "Online" : event.location}
                          </span>
                        )}
                      </p>
                      <h3
                        className="font-serif leading-snug mb-2 transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                        style={{ fontSize: "1.3rem", fontWeight: 500, color: "var(--ink-900)" }}
                      >
                        {event.title}
                      </h3>
                      <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--fg2)" }}>
                        {event.description}
                      </p>
                      <div className="flex justify-end">
                        <span
                          className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm whitespace-nowrap"
                          style={{ background: "var(--lapis-700)", color: "var(--fg-on-dark)", boxShadow: "var(--shadow-sm)" }}
                        >
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
