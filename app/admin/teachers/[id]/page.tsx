import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TeacherForm from "../TeacherForm";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let teacher;
  try {
    teacher = await prisma.teacher.findUnique({ where: { id } });
  } catch {}
  if (!teacher) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Teacher</h1>
      <TeacherForm teacher={teacher} />
    </>
  );
}
