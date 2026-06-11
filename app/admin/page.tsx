import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  try {
    const [events, posts, albums, contacts, subscribers] = await Promise.all([
      prisma.event.count(),
      prisma.post.count(),
      prisma.album.count(),
      prisma.contact.count({ where: { read: false } }),
      prisma.subscriber.count({ where: { active: true } }),
    ]);
    return { events, posts, albums, contacts, subscribers };
  } catch {
    return { events: 0, posts: 0, albums: 0, contacts: 0, subscribers: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Events",          value: stats.events,      href: "/admin/events" },
    { label: "Posts",           value: stats.posts,       href: "/admin/posts" },
    { label: "Albums",          value: stats.albums,      href: "/admin/albums" },
    { label: "Unread messages", value: stats.contacts,    href: "/admin/contacts" },
    { label: "Subscribers",     value: stats.subscribers, href: "/admin/subscribers" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif mb-1" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--ink-900)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--fg2)", fontSize: "0.95rem" }}>
          Welcome back.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        {statCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block rounded-xl p-4 transition-shadow hover:shadow-sm"
            style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg3)" }}>
              {c.label}
            </p>
            <p className="font-serif" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--ink-900)" }}>
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--fg3)" }}>Quick actions</p>
          <div className="space-y-2">
            {[
              ["+ New event",   "/admin/events/new"],
              ["+ New post",    "/admin/posts/new"],
              ["+ New album",   "/admin/albums/new"],
              ["+ Add teacher", "/admin/teachers/new"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ background: "var(--parch-100)", color: "var(--ink-800)", border: "1px solid var(--surface-border)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--fg3)" }}>View on site</p>
          <div className="space-y-1">
            {[
              ["Home",      "/"],
              ["Events",    "/events/upcoming"],
              ["Teachings", "/teachings"],
              ["Music",     "/teachings/music"],
              ["Contact",   "/contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                style={{ color: "var(--ink-700)" }}
              >
                <span>{label}</span>
                <span style={{ color: "var(--fg3)" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
