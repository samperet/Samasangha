import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = { title: "Lineage" };
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

function stripHtml(html: string, maxLen = 200) {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).replace(/\s\w+$/, "") + "…" : plain;
}

const ROLE_LABELS: Record<number, string> = {
  1: "Founder · Inayati Order",
  2: "Creator · Dances of Universal Peace · Ruhaniat",
  3: "Second Pir · Sufi Ruhaniat International",
  4: "Current Pir · Sufi Ruhaniat International",
  5: "Senior mentor teacher · SamaSangha",
  6: "Senior mentor teacher · SamaSangha",
  7: "Ancestor & elder",
  8: "Ancestor & healer",
};

const GROUPS = [
  {
    label: "The Inayati / Ruhaniat lineage",
    description:
      "Our chain of transmission flows from Hazrat Inayat Khan through Murshid Samuel Lewis and his successors in the Sufi Ruhaniat International.",
    orders: [1, 2, 3, 4],
    showNumbers: true,
  },
  {
    label: "Our teachers",
    description:
      "Abraham and Halima have guided SamaSangha in Cambridge since 1972, carrying the direct transmission of Murshid Samuel Lewis.",
    orders: [5, 6],
    showNumbers: false,
  },
  {
    label: "Ancestors",
    description:
      "Elders and healers whose lives and work touched this lineage and the Cambridge community.",
    orders: [7, 8],
    showNumbers: false,
  },
];

export default async function LineagePage() {
  const teachers = await getTeachers();
  const byOrder: Record<number, (typeof teachers)[0]> = {};
  for (const t of teachers) byOrder[t.order] = t;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-16">
        <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>The transmission</p>
        <h1 className="font-serif mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)" }}>
          Lineage
        </h1>
        <div className="flex items-center justify-center gap-3 mb-6" aria-hidden>
          <span style={{ width: 56, height: 1, background: "var(--gold-500)", opacity: 0.45, display: "block" }} />
          <span style={{ color: "var(--gold-500)", fontSize: "0.85rem", opacity: 0.7 }}>✦</span>
          <span style={{ width: 56, height: 1, background: "var(--gold-500)", opacity: 0.45, display: "block" }} />
        </div>
        <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "var(--fg2)", fontSize: "1.05rem" }}>
          We are rooted in the Universal Sufi heart stream of Pir-O-Murshid Hazrat Inayat Khan
          and Murshid Samuel Lewis — a lineage of love, harmony, and beauty held in trust
          by the Sufi Ruhaniat International.
        </p>
      </div>

      {/* Groups */}
      {GROUPS.map((group, gi) => {
        const groupTeachers = group.orders.map((o) => byOrder[o]).filter(Boolean);
        if (groupTeachers.length === 0) return null;

        return (
          <section
            key={group.label}
            className={gi > 0 ? "mt-16 pt-16" : ""}
            style={gi > 0 ? { borderTop: "1px solid var(--surface-border)" } : {}}
          >
            <div className="mb-8">
              <p className="eyebrow mb-1" style={{ fontSize: "0.7rem", color: "var(--gold-600)" }}>
                {group.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)", maxWidth: "52ch" }}>
                {group.description}
              </p>
            </div>

            <div className="space-y-5">
              {groupTeachers.map((teacher, idx) => (
                <Link
                  key={teacher.id}
                  href={`/about/teachers/${teacher.slug}`}
                  className="flex gap-5 rounded-2xl p-5 transition-shadow duration-200 group"
                  style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
                >
                  {/* Chain number */}
                  {group.showNumbers && (
                    <div className="hidden sm:flex flex-col items-center gap-2 shrink-0 pt-1">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: "var(--gold-100)", color: "var(--gold-700)" }}
                      >
                        {idx + 1}
                      </span>
                      {idx < groupTeachers.length - 1 && (
                        <div className="w-px flex-1 min-h-4" style={{ background: "var(--gold-300)", opacity: 0.5 }} />
                      )}
                    </div>
                  )}

                  {/* Portrait */}
                  <div className="shrink-0">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="rounded-xl object-cover object-top"
                        style={{ width: gi === 2 ? 72 : 88, height: gi === 2 ? 72 : 100 }}
                      />
                    ) : (
                      <div
                        className="rounded-xl flex items-center justify-center font-serif text-2xl"
                        style={{ width: gi === 2 ? 72 : 88, height: gi === 2 ? 72 : 100, background: "var(--parch-100)", color: "var(--gold-600)" }}
                      >
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif leading-tight mb-0.5" style={{ fontSize: gi === 2 ? "1.1rem" : "1.2rem", fontWeight: 500, color: "var(--ink-900)" }}>
                      {teacher.name}
                    </h2>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold-600)" }}>
                      {ROLE_LABELS[teacher.order] ?? ""}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--fg2)" }}>
                      {stripHtml(teacher.bio)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 self-center text-sm transition-colors duration-150" style={{ color: "var(--fg3)" }}>
                    →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
