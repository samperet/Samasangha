import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = { title: "Our Teachers" };
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

const LINEAGE_ROLES: Record<string, string> = {
  "hazrat-inayat-khan":     "Founder · Inayati Order · 1882–1927",
  "murshid-samuel-lewis":   "Creator · Dances of Universal Peace · 1896–1971",
  "pir-moineddin-jablonski":"Second Pir · Sufi Ruhaniat International · d. 2001",
  "pir-shabda-kahn":        "Current Pir · Sufi Ruhaniat International",
};

export default async function TeachersPage() {
  const teachers = await getTeachers();

  const ourTeachers = teachers.filter((t) => t.order >= 5 && t.order <= 6); // Abraham, Halima
  const lineage     = teachers.filter((t) => t.order >= 1 && t.order <= 4); // Hazrat → Shabda
  const ancestors   = teachers.filter((t) => t.order >= 7);          // Frida, Karmu

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* Page header */}
      <div className="mb-14">
        <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>Discover</p>
        <h1
          className="font-serif mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)" }}
        >
          About us
        </h1>

        {/* About text — styled sub-context card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
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
      </div>

      {/* ── Our Teachers ─────────────────────────────────────────── */}
      {ourTeachers.length > 0 && (
        <section className="mb-16">
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
            {ourTeachers.map((t) => (
              <Link
                key={t.id}
                href={`/about/teachers/${t.slug}`}
                className="teacher-card rounded-2xl overflow-hidden group"
              >
                {/* Gold top rule */}
                <div className="h-1" style={{ background: "linear-gradient(90deg, var(--gold-500), var(--gold-300))" }} />
                <div className="p-6">
                  {/* Photo */}
                  <div className="flex items-center gap-4 mb-4">
                    {t.photoUrl ? (
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        className="rounded-full object-cover object-top shrink-0"
                        style={{ width: 72, height: 72 }}
                      />
                    ) : (
                      <div
                        className="rounded-full shrink-0 flex items-center justify-center font-serif text-2xl"
                        style={{ width: 72, height: 72, background: "var(--gold-100)", color: "var(--gold-700)" }}
                      >
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2
                        className="font-serif leading-snug"
                        style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--ink-900)" }}
                      >
                        {t.name}
                      </h2>
                      <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "var(--gold-600)" }}>
                        Murshid · SamaSangha
                      </p>
                    </div>
                  </div>
                  {/* Bio excerpt */}
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                    {stripHtml(t.bio)}
                  </p>
                  <p className="text-xs mt-4 font-medium" style={{ color: "var(--crimson-700)" }}>
                    Read more →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Our Lineage ──────────────────────────────────────────── */}
      {lineage.length > 0 && (
        <section className="mb-16 pt-14" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
            Our lineage
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--fg2)", maxWidth: "48ch" }}>
            The chain of transmission in the Sufi Ruhaniat International, from its founding
            teacher to the present day.
          </p>

          <div className="space-y-3">
            {lineage.map((t, idx) => (
              <div key={t.id} className="relative">
                <Link
                  href={`/about/teachers/${t.slug}`}
                  className="teacher-card flex items-center gap-4 rounded-xl p-4 group"
                >
                  {/* Step number */}
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: "var(--gold-100)", color: "var(--gold-700)" }}
                  >
                    {idx + 1}
                  </span>

                  {/* Portrait */}
                  {t.photoUrl ? (
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      className="rounded-full object-cover object-top shrink-0"
                      style={{ width: 52, height: 52 }}
                    />
                  ) : (
                    <div
                      className="rounded-full shrink-0"
                      style={{ width: 52, height: 52, background: "var(--parch-100)" }}
                    />
                  )}

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-serif leading-snug"
                      style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--ink-900)" }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "var(--gold-600)" }}>
                      {LINEAGE_ROLES[t.slug] ?? ""}
                    </p>
                  </div>

                  <span className="text-sm shrink-0" style={{ color: "var(--fg3)" }}>→</span>
                </Link>

                {/* Connector line between cards */}
                {idx < lineage.length - 1 && (
                  <div
                    className="absolute left-[1.75rem] -bottom-3 w-px h-3 z-10"
                    style={{ background: "var(--gold-300)", opacity: 0.6 }}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ancestors ────────────────────────────────────────────── */}
      {ancestors.length > 0 && (
        <section className="pt-14" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-600)" }}>
            Our ancestors
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--fg2)", maxWidth: "48ch" }}>
            Elders and healers whose lives and work touched this lineage and the Cambridge community.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {ancestors.map((t) => (
              <Link
                key={t.id}
                href={`/about/teachers/${t.slug}`}
                className="flex gap-4 items-start rounded-xl p-4 transition-shadow duration-200 group"
                style={{
                  background: "#fff",
                  border: "1px solid var(--surface-border)",
                }}
              >
                {t.photoUrl ? (
                  <img
                    src={t.photoUrl}
                    alt={t.name}
                    className="rounded-lg object-cover object-top shrink-0"
                    style={{ width: 60, height: 60 }}
                  />
                ) : (
                  <div
                    className="rounded-lg shrink-0 flex items-center justify-center font-serif text-xl"
                    style={{ width: 60, height: 60, background: "var(--parch-100)", color: "var(--ink-600)" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-serif leading-snug mb-1"
                    style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ink-900)" }}
                  >
                    {t.name}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--fg2)" }}>
                    {stripHtml(t.bio, 160)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
