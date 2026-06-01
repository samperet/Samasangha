import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostForm from "../PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post;
  try {
    post = await prisma.post.findUnique({ where: { id } });
  } catch {}
  if (!post) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Post</h1>
      <PostForm post={post} />
    </>
  );
}
