import { redirect } from "next/navigation";

// The dashboard was removed, /admin lands on the first section.
export default function AdminIndexPage() {
  redirect("/admin/events");
}
