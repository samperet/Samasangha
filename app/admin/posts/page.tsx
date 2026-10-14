import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PostsTable, { type PostRow } from "./PostsTable";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<PostRow[]> {
  try {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      youtubeUrl: p.youtubeUrl,
      published: p.published,
      createdAt: p.createdAt.toISOString(),
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-[#1a2744]">Posts & Teachings</h1>
        <Link href="/admin/posts/new">
          <Button>+ New Post</Button>
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Category, video link and publish status save as you change them. Click a column heading to sort.
      </p>

      <PostsTable posts={posts} />
    </>
  );
}
