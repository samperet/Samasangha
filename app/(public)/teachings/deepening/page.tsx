import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FileText, PlayCircle } from "lucide-react";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";
import DeepeningGate from "./DeepeningGate";

export const metadata: Metadata = { title: "Mureeds' Deepening" };

// God is Breath, Mureeds Class with Halima & Abraham, following the course
// by Murshid Wali Ali Meyer. PDFs live in /public/assets/deepening/god-is-breath/.
const GIB_BASE = "/assets/deepening/god-is-breath";

// Class session recordings on YouTube (ids only; linked as watch URLs).
// "Compilations" are edited highlights; the numbered parts are full sessions.
const GIB_LESSONS = [
  {
    title: "Lesson 1",
    docs: [
      { label: "Class with Murshid Wali Ali Meyer", file: "lesson-01-wali-ali-class.pdf" },
      { label: "Practice assignments", file: "lesson-01-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-01-readings-gender-neutral.pdf" },
    ],
    videos: [
      { label: "Video Compilation 1", id: "c8Lk80GfRHc" },
      { label: "Video Compilation 2", id: "E1FqEdhW0iU" },
      { label: "Morning Part I", id: "kKR-jasOOww" },
      { label: "Morning Part II", id: "q26SpM0La2g" },
      { label: "Morning Part III", id: "lbX8Z_SNK34" },
      { label: "Morning Part IV", id: "2zetevpMhCA" },
      { label: "Morning Part V", id: "czqksxPx-SY" },
      { label: "Afternoon Part I", id: "8datupgz-kE" },
      { label: "Afternoon Part II", id: "xSXOTOcdkH0" },
      { label: "Afternoon Part III", id: "y7dSRw0yI68" },
      { label: "Afternoon Part IV", id: "LzQMn4o983g" },
      { label: "Afternoon Part V", id: "FW9nJwj58Pg" },
      { label: "Evening Part I", id: "RHxWmBHkES4" },
      { label: "Evening Part II", id: "_UUavR-6QQI" },
      { label: "Evening Part III", id: "kAtTDPkQGHk" },
      { label: "Evening Part IV", id: "VyrCmwqN8BU" },
    ],
  },
  {
    title: "Lesson 2",
    docs: [
      { label: "Class with Murshid Wali Ali Meyer", file: "lesson-02-wali-ali-class.pdf" },
      { label: "Practice assignments", file: "lesson-02-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-02-readings-gender-neutral.pdf" },
    ],
    videos: [
      { label: "Video Compilation 1", id: "Rqc1KOanVtA" },
      { label: "Video Compilation 2", id: "P2L5QE_T1jU" },
      { label: "Morning Part I", id: "tSCpEP_81co" },
      { label: "Morning Part II", id: "-oHh3PBfvjU" },
      { label: "Morning Part III", id: "S354cPCWT48" },
      { label: "Morning Part IV", id: "Oi7s3O2KE7c" },
      { label: "Afternoon Part I", id: "eoxK6JfDF_c" },
      { label: "Afternoon Part II", id: "WJeDGsS_TYU" },
      { label: "Afternoon Part III", id: "FWAuf1ZSoKk" },
      { label: "Evening Part I", id: "nxVS4PD8QWU" },
      { label: "Evening Part II", id: "3DrVXZjReYI" },
    ],
  },
  {
    title: "Lesson 3",
    docs: [
      { label: "Practice assignments", file: "lesson-03-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-03-readings-gender-neutral.pdf" },
    ],
    videos: [
      { label: "Video Compilation 1", id: "mVUwzYfTXDQ" },
      { label: "Video Compilation 2", id: "z5ZkFoI9dU0" },
      { label: "Morning Part I", id: "DD5TQrXGrNs" },
      { label: "Morning Part II", id: "sNw5WhlynPM" },
      { label: "Morning Part III", id: "c6TKt_ofAMo" },
      { label: "Afternoon Part I", id: "xieoYMw_JCE" },
      { label: "Afternoon Part II", id: "k1ub9IUwBfY" },
      { label: "Afternoon Part III", id: "OchwcHyYGzo" },
      { label: "Evening Session", id: "SOfgklAEIc4" },
    ],
  },
  {
    title: "Lesson 4",
    docs: [
      { label: "Practice assignments", file: "lesson-04-practices.pdf" },
      { label: "Readings (gender-neutral)", file: "lesson-04-readings-gender-neutral.pdf" },
    ],
    videos: [
      { label: "Video Compilation 1", id: "esBzJbLywn0" },
      { label: "Video Compilation 2", id: "gmoZPDT3NT0" },
      { label: "Morning Part I", id: "Z3_fJ3oc9zo" },
      { label: "Morning Part II", id: "ZFVRbyMmz28" },
      { label: "Morning Part III", id: "QFpVNhhcmgM" },
      { label: "Afternoon Part I", id: "eHVLFcwUTzs" },
      { label: "Afternoon Part II", id: "e0jLZdJTAcE" },
      { label: "Evening Session", id: "LDQ7088Sgz8" },
    ],
  },
];

export default async function DeepeningPage() {
  // Mureed-only page, unlocked with the class password (admins pass too)
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
          God is Breath, Mureeds Class
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

              {lesson.videos.length > 0 && (
                <>
                  <p className="text-sm font-medium text-stone-500 mt-5 mb-2">
                    Class session videos
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {lesson.videos.map((video) => (
                      <li key={video.id}>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 text-[#8f2a23] hover:underline text-sm"
                        >
                          <PlayCircle size={15} className="shrink-0 text-stone-400" />
                          {video.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
