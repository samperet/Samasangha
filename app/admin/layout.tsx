import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Only /admin/login is reachable without a session (proxy redirects the rest)
  if (!session) return <>{children}</>;
  return (
    <div className="flex min-h-screen" style={{ background: "var(--parch-50)" }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
