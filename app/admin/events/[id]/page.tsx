import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventForm from "../EventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  try {
    event = await prisma.event.findUnique({ where: { id } });
  } catch {}
  if (!event) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Event</h1>
      <EventForm event={event} />
    </>
  );
}
