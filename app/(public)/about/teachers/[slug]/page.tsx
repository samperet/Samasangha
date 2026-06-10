import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/about/teachers"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8 inline-block"
      >
        ← Teachers & Lineage
      </Link>
      <div className="flex gap-6 items-start mb-8">
        {teacher.photoUrl && (
          <img
            src={teacher.photoUrl}
            alt={teacher.name}
            className="w-28 h-28 rounded-full object-cover flex-shrink-0"
          />
        )}
        <h1 className="text-3xl font-bold text-stone-800 leading-snug self-end">{teacher.name}</h1>
      </div>
      <div
        className="prose prose-stone max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: teacher.bio }}
      />

      {/* Abraham photo */}
      {slug === "abraham-sussman" && (
        <div className="mt-10">
          <Image
            src="/assets/AbrahamDalilama.jpeg"
            alt="Abraham with the Dalai Lama"
            width={600}
            height={400}
            className="rounded-2xl w-full object-cover"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          />
        </div>
      )}

      {/* Linked writings */}
      {(slug === "abraham-sussman" || slug === "halima-sussman") && (
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <p className="eyebrow mb-4" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>
            Writings
          </p>
          {slug === "abraham-sussman" && (
            <Link
              href="/teachings/dances/articles/dancing-the-heart-awake"
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
                  On the art, craft, and spiritual practice of Dance leading — the essential
                  ingredients for heart awakening in the Dances of Universal Peace.
                </p>
              </div>
              <span className="text-sm shrink-0 pt-1" style={{ color: "var(--fg3)" }}>→</span>
            </Link>
          )}
          {slug === "halima-sussman" && (
            <Link
              href="/teachings/dances/articles/be-ye-songs-of-glory"
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
    </div>
  );
}
