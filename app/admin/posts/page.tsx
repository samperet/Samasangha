import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

const CATEGORY_LABELS: Record<string, string> = {
  DHARMA_GEM: "Dharma Gem",
  TALK: "Talk",
  DANCE_ARTICLE: "Dance Article",
  DANCE_INTERVIEW: "Dance Interview",
  ORIGINAL_DANCE: "Original Dance",
  RESOURCE: "Resource",
};

async function getPosts() {
  try {
    return await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Posts & Teachings</h1>
        <Link href="/admin/posts/new">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#1a2744]">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDateShort(p.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/posts/${p.id}`} className="text-[#1a2744] hover:underline text-xs">Edit</Link>
                    <DeleteButton id={p.id} endpoint="/api/admin/posts" label="post" name={p.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
}
