import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Only /admin/login is reachable without a session (proxy redirects the rest)
  if (!session) return <>{children}</>;
  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: "var(--parch-50)" }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
