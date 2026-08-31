import Link from "next/link";
import InvocationCarousel from "@/components/public/InvocationCarousel";
import GatheringCards from "@/components/public/GatheringCards";
import SaveTheDate from "@/components/public/SaveTheDate";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";

export const revalidate = 60;

async function getUpcomingEvents() {
  try {
    return await prisma.event.findMany({
      where: { published: true, featured: true, startDate: { gt: new Date() } },
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
      {/* ── Masthead, homepage only — sized to content with vertical margin ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden px-5 pt-8 pb-12 sm:pt-10 sm:pb-14"
        style={{
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
        {/* Same max width as the About card below, so the two line up. */}
        <div className="relative w-full max-w-4xl">
          <InvocationCarousel />
        </div>
      </div>

      {/* ── About us + the regular gatherings, together on the blue lotus
            wallpaper. The flat blue underneath is sampled from the image, so
            there's no colour flash before it loads. ── */}
      <section
        role="region"
        aria-label="About SamaSangha and regular gatherings"
        className="relative pt-14 pb-16 md:pb-20 px-5 text-center overflow-hidden"
        style={{
          // Flat tone drawn from the wallpaper's own blue. The lotus pattern
          // now frames the page edges, so repeating it here would be noisy.
          backgroundColor: "#5aa8c4",
          borderTop: "1px solid var(--surface-border)",
          borderBottom: "1px solid var(--surface-border)",
        }}
      >

        {/* Community intro: the photo across the top, the welcome line and a
            link to the Welcome page beneath it. */}
        <div
          className="relative z-10 mx-auto max-w-4xl rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--surface-border)" }}
        >
          {/* Full width, with the text beneath. Beside the text the photo left a
              band of cream under itself: it is a 2.48:1 letterbox, so at half the
              card it stood shorter than the text column, and it can't be stretched
              to match without cropping off the hand and the Quan Yin painting.
              The -1px closes the sub-pixel seam above the text panel. */}
          <Image
            src="/assets/AHHA.png"
            alt="Abraham and Halima"
            width={640}
            height={258}
            className="block w-full"
            style={{ marginBottom: -1 }}
          />
          <div className="text-center px-6 pb-8 pt-6 md:p-9">
            <blockquote
              className="font-serif not-italic"
              style={{
                fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "var(--ink-900)",
                margin: 0,
                borderLeft: "none",
              }}
            >
              We are rooted in the universal Sufi heart stream.
            </blockquote>
            <p className="mt-4 text-sm">
              <Link href="/welcome" className="underline" style={{ color: "var(--link)" }}>
                Learn more on our Welcome page →
              </Link>
            </p>
          </div>
        </div>

        {/* Regular gatherings. The generous top margin leaves room for the
            card images, which protrude above their cards. */}
        <div className="relative z-10 mt-32 md:mt-36">
          <GatheringCards />
        </div>
      </section>

      {/* ── Retreats ────────────────────────────────────────────── */}
      <section
        role="region"
        aria-label="Retreats"
        className="py-16 md:py-20 px-5"
        style={{
          background: "var(--parch-50)",
          borderTop: "1px solid var(--surface-border)",
        }}
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
                <div
                  key={event.id}
                  className="gold-shadow group rounded-[14px] overflow-hidden relative"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--surface-border)" }}
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
                      <h3
                        className="font-serif leading-snug mb-1.5"
                        style={{ fontSize: "1.7rem", fontWeight: 500, color: "var(--ink-900)" }}
                      >
                        <Link
                          href={`/events/${event.slug}`}
                          className="transition-colors duration-150 hover:[color:var(--crimson-700)]"
                          style={{ color: "var(--ink-900)" }}
                        >
                          {event.title}
                        </Link>
                      </h3>
                      <p className="text-sm font-semibold mb-2" style={{ color: "var(--gold-700)" }}>
                        {formatDateRange(event.startDate, event.endDate)}
                        {(event.location || event.isOnline) && (
                          <span className="font-normal" style={{ color: "var(--fg2)" }}>
                            {"  ·  "}{event.isOnline ? "Online" : event.location}
                          </span>
                        )}
                      </p>
                      <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--fg2)" }}>
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-3 justify-end items-center">
                        {event.flyerUrl && (
                          <a
                            href={event.flyerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold underline underline-offset-2 whitespace-nowrap mr-auto"
                            style={{ color: "var(--link)" }}
                          >
                            {/\.pdf(\?|#|$)/i.test(event.flyerUrl) ? "View flyer (PDF)" : "View flyer"}
                          </a>
                        )}
                        {event.registrationEnabled ? (
                          <Link
                            href={`/events/${event.slug}/register`}
                            className="text-sm font-semibold underline underline-offset-2 whitespace-nowrap self-center"
                            style={{ color: "var(--link)" }}
                          >
                            Register
                          </Link>
                        ) : event.registerUrl ? (
                          <a
                            href={event.registerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold underline underline-offset-2 whitespace-nowrap self-center"
                            style={{ color: "var(--link)" }}
                          >
                            Register
                          </a>
                        ) : null}
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-block font-semibold px-6 py-2.5 rounded-lg text-sm whitespace-nowrap"
                          style={{ background: "#3a8db7", color: "#ffffff", boxShadow: "var(--shadow-sm)" }}
                        >
                          Learn more →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SaveTheDate className="mt-8" />

          <div className="mt-10 text-center">
            <Link
              href="/events/upcoming"
              className="text-sm font-semibold underline underline-offset-2"
              style={{ color: "var(--link)" }}
            >
              View all retreats →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
