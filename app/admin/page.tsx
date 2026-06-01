import { auth } from "@/lib/auth";
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
  const session = await auth();
  const stats = await getStats();

  const cards = [
    { label: "Events", value: stats.events, href: "/admin/events", color: "bg-blue-50 text-blue-700" },
    { label: "Posts", value: stats.posts, href: "/admin/posts", color: "bg-purple-50 text-purple-700" },
    { label: "Albums", value: stats.albums, href: "/admin/albums", color: "bg-green-50 text-green-700" },
    { label: "Unread Messages", value: stats.contacts, href: "/admin/contacts", color: "bg-orange-50 text-orange-700" },
    { label: "Subscribers", value: stats.subscribers, href: "/admin/subscribers", color: "bg-[#c9a84c]/10 text-[#c9a84c]" },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="block rounded-xl border bg-white p-5 hover:shadow-sm transition-shadow">
            <p className="text-sm text-gray-500 mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color.split(" ")[1]}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-[#1a2744] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              ["Add Event", "/admin/events/new"],
              ["Write Post / Dharma Gem", "/admin/posts/new"],
              ["Add Album", "/admin/albums/new"],
              ["Add Teacher", "/admin/teachers/new"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2 bg-[#1a2744] text-white rounded text-sm hover:bg-[#243560] transition-colors"
              >
                + {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-[#1a2744] mb-4">Site Sections</h2>
          <div className="space-y-1 text-sm">
            {[
              ["Public Site", "/"],
              ["Events", "/events"],
              ["Teachings", "/teachings"],
              ["Music", "/teachings/music"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-1.5 rounded hover:bg-gray-50 text-gray-600 hover:text-[#1a2744] transition-colors"
              >
                {label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
