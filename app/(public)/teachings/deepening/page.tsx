import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";
import DeepeningGate from "./DeepeningGate";

export const metadata: Metadata = { title: "Mureeds' Deepening" };

// God is Breath — Mureeds Class with Halima & Abraham, following the course
// by Murshid Wali Ali Meyer. PDFs live in /public/assets/deepening/god-is-breath/.
const GIB_BASE = "/assets/deepening/god-is-breath";

const GIB_LESSONS = [
  {
    title: "Lesson 1",
    docs: [
      { label: "Class with Murshid Wali Ali Meyer", file: "lesson-01-wali-ali-class.pdf" },
      { label: "Practice assignments", file: "lesson-01-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-01-readings-gender-neutral.pdf" },
    ],
  },
  {
    title: "Lesson 2",
    docs: [
      { label: "Class with Murshid Wali Ali Meyer", file: "lesson-02-wali-ali-class.pdf" },
      { label: "Practice assignments", file: "lesson-02-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-02-readings-gender-neutral.pdf" },
    ],
  },
  {
    title: "Lesson 3",
    docs: [
      { label: "Practice assignments", file: "lesson-03-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-03-readings-gender-neutral.pdf" },
    ],
  },
  {
    title: "Lesson 4",
    docs: [
      { label: "Practice assignments", file: "lesson-04-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-04-readings-gender-neutral.pdf" },
    ],
  },
];

export default async function DeepeningPage() {
  // Mureed-only page — unlocked with the class password (admins pass too)
  const store = await cookies();
  const unlocked =
    (await verifyDeepeningToken(store.get(DEEPENING_COOKIE)?.value)) ||
    (await verifySessionToken(store.get(ADMIN_COOKIE)?.value));

  if (!unlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-stone-800 mb-10 text-center">
          Mureeds&rsquo; Deepening
        </h1>
        <DeepeningGate />
      </div>
    );
  }

  let content = "";
  try {
    const page = await prisma.page.findUnique({ where: { slug: "deepening" } });
    content = page?.content ?? "";
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-800 mb-10">Mureeds&rsquo; Deepening</h1>

      {content && (
        <div
          className="prose prose-stone max-w-none leading-relaxed mb-14"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* ── God is Breath study library ─────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold text-stone-800 mb-2">
          God is Breath — Mureeds Class
        </h2>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Study guide for Course 1 (2023/2024) with Halima &amp; Abraham, following
          the course offered by Murshid Wali Ali Meyer. Each lesson gathers the
          class text, practice assignments, and readings to view or download.
        </p>

        <div className="space-y-6">
          {GIB_LESSONS.map((lesson) => (
            <div
              key={lesson.title}
              className="rounded-xl border border-stone-200 bg-white/60 px-6 py-5"
            >
              <h3 className="font-semibold text-stone-700 mb-3">{lesson.title}</h3>
              <ul className="space-y-2">
                {lesson.docs.map((doc) => (
                  <li key={doc.file}>
                    <a
                      href={`${GIB_BASE}/${doc.file}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2.5 text-[#8f2a23] hover:underline"
                    >
                      <FileText size={16} className="shrink-0 text-stone-400" />
                      {doc.label}
                      <span className="text-xs text-stone-400">PDF</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
