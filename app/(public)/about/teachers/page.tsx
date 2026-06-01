import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Teachers" };
export const revalidate = 300;

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Our Teachers</h1>
      <p className="text-gray-600 mb-10">
        Meet the guides who lead practices, retreats, and teachings within our community.
      </p>
      {teachers.length === 0 ? (
        <p className="text-gray-400 italic">Teacher bios coming soon.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {teachers.map((t) => (
            <div key={t.id} className="flex gap-4">
              {t.photoUrl && (
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div>
                <h2 className="font-bold text-[#1a2744] text-xl">{t.name}</h2>
                <div
                  className="prose prose-sm mt-2 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: t.bio }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
