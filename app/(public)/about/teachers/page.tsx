import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LINEAGE_META } from "@/lib/lineage";

export const metadata: Metadata = { title: "Teachers & Lineage" };
export const revalidate = 300;

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

function stripHtml(html: string, maxLen = 220) {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).replace(/\s\w+$/, "") + "…" : plain;
}

// Small gold heart node on the silsila connector line
function ChainHeart() {
  return (
    <svg aria-hidden width="14" height="13" viewBox="0 0 20 18" fill="var(--gold-500)" style={{ opacity: 0.9 }}>
      <path d="M10 17 C10 17 1 11 1 5.5 A4.5 4.5 0 0 1 10 3.8 A4.5 4.5 0 0 1 19 5.5 C19 11 10 17 10 17Z" />
    </svg>
  );
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  const ourTeachers = teachers.filter((t) => t.order >= 5 && t.order <= 6); // Abraham, Halima
  const lineage     = teachers.filter((t) => t.order >= 1 && t.order <= 4); // Hazrat → Shabda
  const ancestors   = teachers.filter((t) => t.order >= 7);                 // Frida, Karmu

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Discover</p>
        <h1
          className="font-serif"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.1 }}
        >
          Teachers &amp; Lineage
        </h1>
        <div className="flex justify-center my-5" aria-hidden>
          <img src="/assets/decorative-line.png" alt="" className="h-6 w-auto" />
        </div>
        <p className="leading-relaxed max-w-xl mx-auto" style={{ color: "var(--fg2)" }}>
          The stream of transmission that carries our practice — from Hazrat Inayat Khan,
          who first brought the Sufi Message west, to the teachers who guide SamaSangha today,
          and the ancestors who blessed this community.
        </p>
      </div>

      {/* ── Our Teachers ─────────────────────────────────────────── */}
      {ourTeachers.length > 0 && (
        <section className="mb-20">
          <p className="eyebrow mb-6" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
            Our teachers
          </p>

          {/* Yurt photo */}
          <div className="mb-6 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
            <img
              src="/assets/AHHA-in-the-yurt.png"
              alt="Abraham and Halima in the yurt"
              className="w-full object-cover"
              style={{ maxHeight: 320, objectPosition: "center 20%" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {ourTeachers.map((t) => {
              const meta = LINEAGE_META[t.slug];
              return (
                <Link
                  key={t.id}
                  href={`/about/teachers/${t.slug}`}
                  className="teacher-card rounded-2xl overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={meta?.portrait ?? t.photoUrl ?? ""}
                        alt={t.name}
                        className="rounded-full object-cover object-top shrink-0"
                        style={{ width: 84, height: 84, border: "2px solid var(--gold-200)" }}
                      />
                      <div>
                        <h2
                          className="font-serif leading-snug transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                          style={{ fontSize: "1.35rem", fontWeight: 500, color: "var(--ink-900)" }}
                        >
                          {t.name}
                        </h2>
                        <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--gold-600)" }}>
                          {meta?.role ?? "Murshid · SamaSangha"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                      {stripHtml(t.bio)}
                    </p>
                    <p className="text-xs mt-4 font-medium" style={{ color: "var(--crimson-700)" }}>
                      Read more →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── The Silsila — chain of transmission ──────────────────── */}
      {lineage.length > 0 && (
        <section className="mb-20 pt-14" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
            The silsila — our lineage
          </p>
          <p className="text-sm mb-10" style={{ color: "var(--fg2)", maxWidth: "52ch" }}>
            In Sufism the silsila is the unbroken chain of heart-to-heart transmission from
            teacher to student. Ours flows through the Sufi Ruhaniat International.
          </p>

          <div className="relative">
            {/* The continuous gold thread behind the portraits */}
            <div
              aria-hidden
              className="absolute left-[3.25rem] top-8 bottom-8 w-px hidden sm:block"
              style={{ background: "linear-gradient(var(--gold-300), var(--gold-500), var(--gold-300))", opacity: 0.7 }}
            />

            <div className="space-y-8">
              {lineage.map((t, idx) => {
                const meta = LINEAGE_META[t.slug];
                return (
                  <div key={t.id} className="relative">
                    <Link
                      href={`/about/teachers/${t.slug}`}
                      className="teacher-card group flex flex-col sm:flex-row gap-5 rounded-2xl p-5 sm:items-start relative"
                    >
                      {/* Portrait on the thread */}
                      <div className="relative shrink-0 self-center sm:self-start">
                        <img
                          src={meta?.portrait ?? t.photoUrl ?? ""}
                          alt={t.name}
                          className="rounded-xl object-cover object-top"
                          style={{
                            width: 104, height: 130,
                            border: "2px solid var(--gold-300)",
                            boxShadow: "var(--shadow-md)",
                            background: "var(--parch-100)",
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 sm:pt-1">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3
                            className="font-serif leading-snug transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                            style={{ fontSize: "1.45rem", fontWeight: 500, color: "var(--ink-900)" }}
                          >
                            {t.name}
                          </h3>
                          {meta?.dates && (
                            <span className="font-serif text-sm" style={{ color: "var(--fg3)" }}>
                              {meta.dates}
                            </span>
                          )}
                        </div>
                        <p className="text-xs uppercase tracking-widest mt-1 mb-3" style={{ color: "var(--gold-600)" }}>
                          {meta?.role ?? ""}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                          {stripHtml(t.bio, 200)}
                        </p>
                        {meta?.quote && (
                          <p
                            className="font-serif italic text-sm mt-3 leading-relaxed"
                            style={{ color: "var(--lapis-700)" }}
                          >
                            “{meta.quote.text.length > 120 ? meta.quote.text.slice(0, 120).replace(/\s\w+$/, "") + "…" : meta.quote.text}”
                          </p>
                        )}
                      </div>

                      <span className="hidden sm:block text-sm shrink-0 self-center" style={{ color: "var(--fg3)" }}>→</span>
                    </Link>

                    {/* Heart node between cards, sitting on the thread */}
                    {idx < lineage.length - 1 && (
                      <div
                        className="absolute left-[3.25rem] -bottom-[1.4rem] -translate-x-1/2 z-10 hidden sm:flex"
                        aria-hidden
                      >
                        <ChainHeart />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── About us ─────────────────────────────────────────────── */}
      <section className="mb-20 pt-14" style={{ borderTop: "1px solid var(--surface-border)" }}>
        <p className="eyebrow mb-6" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
          About us
        </p>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--surface-border)" }}
        >
          <div
            className="p-7 space-y-5 leading-relaxed"
            style={{ background: "#fff", color: "var(--fg2)", fontSize: "1.0625rem" }}
          >
            <p>
              SamaSangha is the community of seekers who have gathered in Massachusetts, and also
              far and wide, with the guidance of Sufi Murshids Halima and Abraham.
            </p>
            <p>
              In the Sufi Ruhaniat lineage of Pir-o-Murshid Hazrat Inayat Khan and Murshid Samuel
              Lewis our sangha supports our collective realization that love, harmony, and beauty are
              the foundation of spiritual life. Tuning to the interconnected nature which unites all
              of creation, our practice serves the protection of all life on Earth.
            </p>
            <p>
              Since 1972 Halima and Abraham have been leading gatherings of the Dances of Universal
              Peace in Cambridge Massachusetts, where Murshid Sam first brought the dances in 1969.
              Sama (which refers to the sacred dance and music) is the name of our center and our
              sangha includes our many friends who have shared these practices with us. In recent
              years Halima and Abraham have traveled to Russia, Colombia, Ecuador, Mexico, New
              Zealand, Australia, Holland, Latvia, and Spain, and the many friends they have made
              around the world have also become part of SamaSangha.
            </p>
            <p>
              Through regular in person and online teachings and gatherings, this sangha continues
              to grow.
            </p>
          </div>
        </div>
      </section>

      {/* ── Honored ancestors ────────────────────────────────────── */}
      {ancestors.length > 0 && (
        <section className="pt-14" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
            Honored ancestors
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--fg2)", maxWidth: "48ch" }}>
            Elders and healers whose lives and work touched this lineage and the Cambridge community.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {ancestors.map((t) => {
              const meta = LINEAGE_META[t.slug];
              return (
                <Link
                  key={t.id}
                  href={`/about/teachers/${t.slug}`}
                  className="teacher-card group rounded-2xl overflow-hidden"
                >
                  <div className="flex gap-5 items-start p-5">
                    <img
                      src={meta?.portrait ?? t.photoUrl ?? ""}
                      alt={t.name}
                      className="rounded-xl object-cover object-top shrink-0"
                      style={{ width: 88, height: 110, border: "2px solid var(--gold-200)", boxShadow: "var(--shadow-sm)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h3
                          className="font-serif leading-snug transition-colors duration-150 group-hover:[color:var(--crimson-700)]"
                          style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--ink-900)" }}
                        >
                          {t.name}
                        </h3>
                        {meta?.dates && (
                          <span className="font-serif text-xs" style={{ color: "var(--fg3)" }}>{meta.dates}</span>
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-widest mt-0.5 mb-2" style={{ color: "var(--gold-600)" }}>
                        {meta?.role ?? ""}
                      </p>
                      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--fg2)" }}>
                        {stripHtml(t.bio, 150)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
