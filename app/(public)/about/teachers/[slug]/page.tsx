import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LINEAGE_META, LINEAGE_ORDER } from "@/lib/lineage";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return teachers.map((t) => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.teacher.findUnique({ where: { slug } }).catch(() => null);
  return { title: t?.name ?? "Teacher" };
}

export default async function TeacherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { slug, published: true },
  }).catch(() => null);

  if (!teacher) notFound();

  const meta = LINEAGE_META[slug];

  // Prev/next along the lineage chain
  const idx = LINEAGE_ORDER.indexOf(slug);
  const prevSlug = idx > 0 ? LINEAGE_ORDER[idx - 1] : null;
  const nextSlug = idx >= 0 && idx < LINEAGE_ORDER.length - 1 ? LINEAGE_ORDER[idx + 1] : null;
  const [prev, next] = await Promise.all([
    prevSlug ? prisma.teacher.findUnique({ where: { slug: prevSlug }, select: { name: true, slug: true } }).catch(() => null) : null,
    nextSlug ? prisma.teacher.findUnique({ where: { slug: nextSlug }, select: { name: true, slug: true } }).catch(() => null) : null,
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/about/teachers"
        className="text-sm transition-colors mb-10 inline-block"
        style={{ color: "var(--fg3)" }}
      >
        ← Teachers &amp; Lineage
      </Link>

      {/* ── Hero: framed portrait + name block ───────────────────── */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-10">
        <img
          src={meta?.portrait ?? teacher.photoUrl ?? ""}
          alt={teacher.name}
          className="rounded-2xl object-cover object-top shrink-0"
          style={{
            width: 190,
            border: "3px solid var(--gold-300)",
            boxShadow: "var(--shadow-lg)",
            background: "var(--parch-100)",
          }}
        />
        <div className="text-center sm:text-left sm:pt-3">
          {meta?.role && (
            <p className="eyebrow mb-2" style={{ fontSize: "0.7rem", color: "var(--gold-600)" }}>
              {meta.role}
            </p>
          )}
          <h1
            className="font-serif leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 2.7rem)", fontWeight: 500, color: "var(--ink-900)" }}
          >
            {teacher.name}
          </h1>
          {meta?.dates && (
            <p className="font-serif mt-1" style={{ fontSize: "1.15rem", color: "var(--fg3)" }}>
              {meta.dates}
            </p>
          )}
          {meta?.quote && (
            <blockquote className="mt-5 text-left" style={{ fontSize: "1.1rem", maxWidth: "44ch" }}>
              “{meta.quote.text}”
              <footer className="not-italic text-sm mt-2" style={{ color: "var(--fg3)" }}>
                {meta.quote.attribution}
              </footer>
            </blockquote>
          )}
        </div>
      </div>

      {/* Rose flourish */}
      <div className="flex justify-center mb-10" aria-hidden>
        <img src="/assets/decorative-line.png" alt="" className="h-5 w-auto opacity-70" />
      </div>

      {/* ── Biography ─────────────────────────────────────────────── */}
      <div
        className="prose prose-stone max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: teacher.bio }}
      />

      {/* ── Elemental Invocation (Hazrat Inayat Khan only) ────────── */}
      {slug === "hazrat-inayat-khan" && (
        <div className="mt-12 pt-10" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>
            Listen · Elemental Invocation
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--fg2)" }}>
            The Elemental Invocation, sung in the tradition of Hazrat Inayat Khan.
          </p>
          <audio controls preload="none" className="w-full">
            <source src="/assets/Elementsinging.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* ── Photographs ───────────────────────────────────────────── */}
      {meta?.gallery && meta.gallery.length > 0 && (
        <div className="mt-12 pt-10" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-6" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>
            Photographs
          </p>
          <div className={`grid gap-5 ${meta.gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {meta.gallery.map((photo) => (
              <figure key={photo.src} className="m-0">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="rounded-xl w-full object-cover"
                  style={{ border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
                />
                {photo.caption && (
                  <figcaption className="text-xs mt-2 italic" style={{ color: "var(--fg3)" }}>
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* ── Linked writings ───────────────────────────────────────── */}
      {(slug === "abraham-sussman" || slug === "halima-sussman") && (
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-4" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>
            Writings
          </p>
          {slug === "abraham-sussman" && (
            <Link
              href="/deepen/dances/articles/dancing-the-heart-awake"
              className="flex items-start gap-4 rounded-xl p-4 transition-shadow duration-200 teacher-card group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold-600)" }}>
                  Dance leadership · Elements of Mastery
                </p>
                <h3 className="font-serif mb-1" style={{ fontSize: "1.15rem", fontWeight: 500, color: "var(--ink-900)" }}>
                  Dancing the Heart Awake
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                  On the art, craft, and spiritual practice of Dance leading, the essential
                  ingredients for heart awakening in the Dances of Universal Peace.
                </p>
              </div>
              <span className="text-sm shrink-0 pt-1" style={{ color: "var(--fg3)" }}>→</span>
            </Link>
          )}
          {slug === "halima-sussman" && (
            <Link
              href="/deepen/dances/articles/be-ye-songs-of-glory"
              className="flex items-start gap-4 rounded-xl p-4 transition-shadow duration-200 teacher-card group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold-600)" }}>
                  Dance leadership · Elements of Mastery
                </p>
                <h3 className="font-serif mb-1" style={{ fontSize: "1.15rem", fontWeight: 500, color: "var(--ink-900)" }}>
                  &ldquo;Be Ye Songs of Glory&rdquo;
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                  On cultivating effacement, fana, and the capacity to become a conduit for
                  transformative experience in the Dances of Universal Peace.
                </p>
              </div>
              <span className="text-sm shrink-0 pt-1" style={{ color: "var(--fg3)" }}>→</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Lineage prev / next ───────────────────────────────────── */}
      {(prev || next) && (
        <nav
          className="mt-14 pt-8 flex items-stretch justify-between gap-4"
          style={{ borderTop: "1px solid var(--surface-border)" }}
          aria-label="Lineage navigation"
        >
          {prev ? (
            <Link href={`/about/teachers/${prev.slug}`} className="group text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg3)" }}>← Earlier in the lineage</p>
              <p className="font-serif transition-colors duration-150 group-hover:[color:var(--crimson-700)]" style={{ fontSize: "1.1rem", color: "var(--ink-900)" }}>
                {prev.name}
              </p>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/about/teachers/${next.slug}`} className="group text-right">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg3)" }}>Later in the lineage →</p>
              <p className="font-serif transition-colors duration-150 group-hover:[color:var(--crimson-700)]" style={{ fontSize: "1.1rem", color: "var(--ink-900)" }}>
                {next.name}
              </p>
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
