import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "Dharma Gems" };
export const revalidate = 60;

const VIDEOS = [
  { id: "LFIvAwrEhSU", title: "4 Part Bismillah w/ Halima, Abraham, Petaluma & Khusrau" },
  { id: "ImO9ZCEL49Y", title: "Murshid Sam Smile Baraka" },
  { id: "Y0FbLe_fSck", title: "Dharma Gem — Love and Death" },
  { id: "gkyHx6GXG_w", title: "Om Nama Shivaya with Pir Moineddin Jablonski" },
  { id: "TRnswLINMgA", title: "Story of Shambala, the Bodhisattva Warrior" },
  { id: "8S8NN8PtGHQ", title: "Halima reads from Jack Kornfield" },
  { id: "7swiwPMs01w", title: "2018 Jamiat Khas — Murshid Abraham" },
  { id: "_27A9W0Q6ms", title: "SamaSangha Choir — Subhanallah" },
  { id: "WT3U_XaTdMI", title: "Solstice Breathing Practice" },
  { id: "hTjGhhNEaWk", title: "Divine Light" },
  { id: "gdy_Y4hzrsE", title: "Basira's Dharma Gem" },
  { id: "mfd6Vxs53TU", title: "Abraham Dharma Gem" },
  { id: "AvR4KZkCGmE", title: "Truth Beyond Reason — Aslan Memorial" },
  { id: "S5GcpoBi4aM", title: "Truth Beyond Reason — For Murshid Aslan (Abraham Solo)" },
  { id: "KbQHeETOam8", title: "Loka Samasta — May All Beings Be Well" },
];

async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true, category: "DHARMA_GEM" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function DharmaGemsPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* Header image */}
      <div className="mb-10 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <Image
          src="/assets/Dharma-Gems.png"
          alt="Dharma Gems"
          width={900}
          height={400}
          className="w-full object-cover"
          priority
        />
      </div>

      <h1 className="font-serif mb-2" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 500, color: "var(--ink-900)" }}>
        Dharma Gems
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--fg2)" }}>
        Short teachings, reflections, and moments of practice from the sangha.
      </p>

      {/* Written posts */}
      {posts.length > 0 && (
        <div className="space-y-10 mb-16">
          {posts.map((post) => (
            <article key={post.id} className="pb-10" style={{ borderBottom: "1px solid var(--surface-border)" }}>
              {post.publishedAt && (
                <p className="eyebrow mb-2" style={{ fontSize: "0.68rem", color: "var(--gold-600)" }}>
                  {formatDate(post.publishedAt)}
                </p>
              )}
              <Link href={`/teachings/dharma-gems/${post.slug}`}>
                <h2
                  className="font-serif mb-2 leading-snug transition-colors text-ink-900 hover:text-crimson-700"
                  style={{ fontSize: "1.3rem", fontWeight: 500 }}
                >
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--fg2)" }}>{post.excerpt}</p>
              )}
              <Link
                href={`/teachings/dharma-gems/${post.slug}`}
                className="text-sm underline underline-offset-2 transition-colors"
                style={{ color: "var(--crimson-700)" }}
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Video section */}
      <div style={{ borderTop: posts.length > 0 ? "none" : undefined }}>
        <p className="eyebrow mb-2" style={{ fontSize: "0.72rem", color: "var(--gold-700)" }}>Video teachings</p>
        <p className="text-sm mb-8" style={{ color: "var(--fg2)" }}>
          Moments of practice, blessing, and reflection from the SamaSangha community.
        </p>

        <div className="space-y-10">
          {VIDEOS.map(({ id, title }) => (
            <div key={id}>
              <div className="rounded-xl overflow-hidden mb-3" style={{ boxShadow: "var(--shadow-sm)", aspectRatio: "16/9", position: "relative" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--ink-800)" }}>{title}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
