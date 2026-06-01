import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import SubscribeForm from "@/components/public/SubscribeForm";

export const revalidate = 60;

async function getFeaturedEvents() {
  try {
    return await prisma.event.findMany({
      where: { published: true, featured: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const events = await getFeaturedEvents();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1a2744] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c9a84c] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-28 text-center">
          <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-4">
            Northeast Sufi Circle
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Toward the One
          </h1>
          <p className="text-xl md:text-2xl text-white/80 italic mb-8">
            The Perfection of Love, Harmony, and Beauty
          </p>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10">
            SamaSangha is a Sufi spiritual community in Massachusetts offering
            teachings, music, retreats, and the Dances of Universal Peace.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events/upcoming"
              className="px-8 py-3 bg-[#c9a84c] hover:bg-[#b8973b] text-white rounded font-medium transition-colors"
            >
              Upcoming Events
            </Link>
            <Link
              href="/about/our-story"
              className="px-8 py-3 border border-white/40 hover:border-white text-white rounded font-medium transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* New here? */}
      <section className="bg-[#f9f5ef] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1a2744] mb-4">New Here? Start Here.</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Whether you&apos;re drawn by the music, the teachings, or simply a quiet
            longing — you are welcome. SamaSangha is the local community of the
            Northeast Sufi Circle, part of the Inayati Order founded by Hazrat
            Inayat Khan.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
            {[
              {
                title: "Our Lineage",
                desc: "Discover the Sufi tradition of Hazrat Inayat Khan and how it flows into our community.",
                href: "/about/lineage",
              },
              {
                title: "Tuesday Practice",
                desc: "Join our weekly online gathering for zikr, meditation, and community.",
                href: "/teachings/tuesday-practice",
              },
              {
                title: "Dances of Universal Peace",
                desc: "Sacred circle dances drawing from all spiritual traditions — open to everyone.",
                href: "/teachings/dances",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <h3 className="font-bold text-[#1a2744] mb-2 group-hover:text-[#c9a84c] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {events.length > 0 && (
        <section className="py-16 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1a2744] mb-8 text-center">
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/upcoming`}
                className="block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {event.flyerUrl && (
                  <img
                    src={event.flyerUrl}
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-[#c9a84c] text-xs font-medium uppercase tracking-wide mb-1">
                    {formatDateShort(event.startDate)}
                    {event.isRetreat && " · Retreat"}
                  </p>
                  <h3 className="font-bold text-[#1a2744] mb-2">{event.title}</h3>
                  {event.location && (
                    <p className="text-sm text-gray-500">{event.location}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/events/upcoming"
              className="inline-block px-6 py-2 border border-[#1a2744] text-[#1a2744] hover:bg-[#1a2744] hover:text-white rounded transition-colors"
            >
              View All Events
            </Link>
          </div>
        </section>
      )}

      {/* About / Relationship */}
      <section className="bg-[#1a2744] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#c9a84c]">
            SamaSangha & the Northeast Sufi Circle
          </h2>
          <p className="text-white/80 leading-relaxed mb-6">
            SamaSangha is the local sangha (community) of the Northeast Sufi Circle,
            a regional branch of the Inayati Order. We gather for weekly practices,
            seasonal retreats, music, and the universal sacred dances — all in the
            spirit of Hazrat Inayat Khan&apos;s teaching that the whole of creation is
            God&apos;s symphony.
          </p>
          <Link href="/about" className="text-[#c9a84c] hover:underline font-medium">
            Learn more about us →
          </Link>
        </div>
      </section>

      {/* Mailing list */}
      <section className="bg-[#f9f5ef] py-12">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-2">Stay in Touch</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Receive updates on events, teachings, and community news.
          </p>
          <div className="flex justify-center">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
