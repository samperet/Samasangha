import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

function ytUrl(id: string) { return `https://www.youtube.com/watch?v=${id}`; }
function embedUrl(id: string) { return `https://www.youtube.com/embed/${id}`; }
function thumb(id: string) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }
function embedHtml(id: string) {
  return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" src="${embedUrl(id)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
}

async function main() {
  console.log("Seeding YouTube videos…\n");

  // ── MusicVideo records ───────────────────────────────────────────────────

  const musicVideos = [
    {
      slug: "samasangha-choir-subhanallah",
      title: "Dharma Gem: SamaSangha Choir Subhanallah",
      description: "February 2022. SamaSangha choir recording from a Jamiat Khas gathering.",
      youtubeUrl: ytUrl("_27A9W0Q6ms"),
      thumbnailUrl: thumb("_27A9W0Q6ms"),
    },
    {
      slug: "abraham-song-for-samuel-lewis",
      title: "Abraham's Song for Samuel Lewis: Sama Sangha",
      description: "October 23, 2021. Abraham's original song in remembrance of Murshid Samuel Lewis.",
      youtubeUrl: ytUrl("bp5ljTNEh-I"),
      thumbnailUrl: thumb("bp5ljTNEh-I"),
    },
    {
      slug: "united-in-the-heart-2021",
      title: "United in the Heart, Sacred Retreat Video",
      description: "July 30–31, 2021. A retreat video woven through the eyes of the beloved.",
      youtubeUrl: ytUrl("gSoWjIl__9Q"),
      thumbnailUrl: thumb("gSoWjIl__9Q"),
    },
    {
      slug: "anna-samia-mountain-mist",
      title: "Горный туман (Mountain Mist), Anna Samia Shatkovskaja",
      description: "Shared by Anna Samia Shatkovskaja for Abraham's birthday, September 30, 2023. Composer and pianist.",
      youtubeUrl: ytUrl("2AiMyj22gBU"),
      thumbnailUrl: thumb("2AiMyj22gBU"),
    },
    {
      slug: "rumi-night-2015-butter-zikr",
      title: "Rumi Night 2015, Butter Zikr",
      description: "A recording from a Rumi Night gathering: Dances of Universal Peace.",
      youtubeUrl: ytUrl("PNdaVwJxYt8"),
      thumbnailUrl: thumb("PNdaVwJxYt8"),
    },
    {
      slug: "karmu-a-place-in-the-sun",
      title: "Karmu: A Place in the Sun",
      description: "Documentary trailer about Karmu, the beloved Cambridge healer and Murshid Sam's 'Black Christ', who turned no one away.",
      youtubeUrl: ytUrl("JJzGXJic87I"),
      thumbnailUrl: thumb("JJzGXJic87I"),
    },
  ];

  for (const v of musicVideos) {
    await prisma.musicVideo.upsert({
      where: { slug: v.slug },
      update: v,
      create: { ...v, published: true },
    });
    console.log(`  musicVideo: ${v.title}`);
  }

  // ── Dharma Gem posts (update existing stubs, create if missing) ──────────

  const dharmaGems = [
    {
      slug: "dharma-gem-kornfield-2022",          // existing stub, update content
      title: "Dharma Gem: Halima reads from Jack Kornfield",
      videoId: "8S8NN8PtGHQ",
      date: new Date("2022-08-05"),
    },
    {
      slug: "dharma-gem-solstice-breathing-2021",
      title: "Dharma Gem, Solstice Breathing Practice",
      videoId: "WT3U_XaTdMI",
      date: new Date("2021-12-21"),
    },
    {
      slug: "dharma-gem-basira-2021",
      title: "Basira's Dharma Gem: Sama Sangha",
      videoId: "gdy_Y4hzrsE",
      date: new Date("2021-10-23"),
    },
    {
      slug: "dharma-gem-divine-light-2021",
      title: "Dharma Gem, Divine Light",
      videoId: "hTjGhhNEaWk",
      date: new Date("2021-12-01"),
    },
    {
      slug: "dharma-gem-abraham-2021",
      title: "Dharma Gem with Abraham",
      videoId: "mfd6Vxs53TU",
      date: new Date("2021-10-23"),
    },
  ];

  for (const g of dharmaGems) {
    const content = embedHtml(g.videoId);
    await prisma.post.upsert({
      where: { slug: g.slug },
      update: { content, title: g.title, publishedAt: g.date, published: true },
      create: {
        slug: g.slug,
        title: g.title,
        content,
        category: "DHARMA_GEM",
        published: true,
        publishedAt: g.date,
      },
    });
    console.log(`  post (DHARMA_GEM): ${g.title}`);
  }

  // ── Talk posts ───────────────────────────────────────────────────────────

  const talks = [
    {
      slug: "talk-2018-jamiat-khas-abraham",
      title: "2018 Jamiat Khas, Murshid Abraham",
      videoId: "7swiwPMs01w",
      excerpt: "A talk by Murshid Abraham at the 2018 Jamiat Khas gathering.",
      date: new Date("2018-01-01"),
    },
    {
      slug: "talk-hidden-treasure-part-1",
      title: "A Hidden Treasure Yearning to Be Known, Part 1",
      videoId: "CiGBRm8hxNA",
      excerpt: "Abraham and Halima, a 2012 teaching from the Jamiat gathering.",
      date: new Date("2012-01-01"),
    },
    {
      slug: "talk-hidden-treasure-part-2",
      title: "A Hidden Treasure Yearning to Be Known, Part 2",
      videoId: "QfhsQdi4Cf0",
      excerpt: "Abraham and Halima, Part 2.",
      date: new Date("2012-01-02"),
    },
    {
      slug: "talk-hidden-treasure-part-3",
      title: "A Hidden Treasure Yearning to Be Known, Part 3",
      videoId: "wfRWL7JjzJw",
      excerpt: "Abraham and Halima, Part 3.",
      date: new Date("2012-01-03"),
    },
    {
      slug: "talk-eat-dance-pray-2024",
      title: "Eat, Dance & Pray 2024, Sama Sangha",
      videoId: "qESSXWOxcrM",
      excerpt: "A glimpse into the Eat, Dance & Pray gathering with Abraham & Halima, Nur Jahan, and Malika, July 2024.",
      date: new Date("2024-07-01"),
    },
    {
      slug: "talk-eat-dance-pray-2023",
      title: "Eat, Dance & Pray 2023, SamaSangha",
      videoId: "oK5W22szz74",
      excerpt: "A glimpse into the Eat, Dance & Pray gathering with Abraham & Halima, Nur Jahan (Chile), Malika (Colombia), & SamaSangha, July 2023.",
      date: new Date("2023-07-01"),
    },
    {
      slug: "talk-rumi-night-2023",
      title: "Rumi Night 2023",
      videoId: "du_JduJecW8",
      excerpt: "A participatory evening of Dances of Universal Peace and the Mystical Poetry of Mevlana Jelaluddin Rumi.",
      date: new Date("2023-01-01"),
    },
    {
      slug: "talk-rumi-in-the-light-2022",
      title: "Rumi in the Light 2022",
      videoId: "_hC5xEz5f6k",
      excerpt: "SamaSangha with Halima, Abraham, with Special Guest Pir Shabda & Friends. Zikr, Light Ritual & the Poetry of Jelaluddin Rumi.",
      date: new Date("2022-01-01"),
    },
  ];

  for (const t of talks) {
    const content = embedHtml(t.videoId);
    await prisma.post.upsert({
      where: { slug: t.slug },
      update: { content, title: t.title, excerpt: t.excerpt, publishedAt: t.date, published: true },
      create: {
        slug: t.slug,
        title: t.title,
        content,
        excerpt: t.excerpt,
        category: "TALK",
        published: true,
        publishedAt: t.date,
      },
    });
    console.log(`  post (TALK): ${t.title}`);
  }

  // ── Dance interview ──────────────────────────────────────────────────────

  await prisma.post.upsert({
    where: { slug: "interview-halima-noor-arjun" },
    update: {
      content: embedHtml("cTYmqJknozA"),
      title: "Interview with Halima and Noor with Arjun, Training of DUP Leaders",
    },
    create: {
      slug: "interview-halima-noor-arjun",
      title: "Interview with Halima and Noor with Arjun, Training of DUP Leaders",
      content: embedHtml("cTYmqJknozA"),
      excerpt: "The first interview of a series presenting senior mentors of the Dances of Universal Peace International Network, exploring the training of dance leaders.",
      category: "DANCE_INTERVIEW",
      published: true,
      publishedAt: new Date("2025-03-11"),
    },
  });
  console.log(`  post (DANCE_INTERVIEW): Training of DUP Leaders`);

  console.log(`\nDone. Seeded ${musicVideos.length} music videos + ${dharmaGems.length} dharma gems + ${talks.length} talks + 1 interview.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
