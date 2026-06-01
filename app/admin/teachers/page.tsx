import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/admin/DeleteButton";

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminTeachersPage() {
  const teachers = await getTeachers();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Teachers</h1>
        <Link href="/admin/teachers/new">
          <Button>+ Add Teacher</Button>
        </Link>
      </div>
      {teachers.length === 0 ? (
        <p className="text-gray-400">No teachers added yet.</p>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              {t.photoUrl && <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1">
                <h3 className="font-semibold text-[#1a2744]">{t.name}</h3>
                <p className="text-gray-400 text-xs">{t.published ? "Published" : "Hidden"} · Order: {t.order}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/teachers/${t.id}`} className="text-[#1a2744] hover:underline">Edit</Link>
                <DeleteButton id={t.id} endpoint="/api/admin/teachers" label="teacher" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
