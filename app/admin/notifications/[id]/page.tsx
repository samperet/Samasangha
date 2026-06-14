import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NotificationForm from "../NotificationForm";

export default async function EditNotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let notification;
  try {
    notification = await prisma.notification.findUnique({ where: { id } });
  } catch {}
  if (!notification) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Edit Notification</h1>
      <NotificationForm notification={notification} />
    </>
  );
}
