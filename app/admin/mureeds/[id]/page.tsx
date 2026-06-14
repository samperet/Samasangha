import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MureedForm from "../MureedForm";

export default async function EditMureedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let profile;
  try {
    profile = await prisma.mureedProfile.findUnique({ where: { id } });
  } catch {}
  if (!profile) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Mureed</h1>
      <MureedForm profile={profile} />
    </>
  );
}
