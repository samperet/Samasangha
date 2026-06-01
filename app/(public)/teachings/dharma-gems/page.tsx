import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Dharma Gems" };
export const revalidate = 60;

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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-2">Dharma Gems</h1>
      <p className="text-gray-500 mb-10">Short teachings and reflections from the tradition.</p>
      {posts.length === 0 ? (
        <p className="text-gray-400 italic">No posts yet. Check back soon.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b pb-8">
              <p className="text-[#c9a84c] text-xs font-medium uppercase tracking-wide mb-1">
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </p>
              <h2 className="text-2xl font-bold text-[#1a2744] mb-3">{post.title}</h2>
              {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
