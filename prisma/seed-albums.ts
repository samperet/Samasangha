import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

type SeedTrack = { title: string; file: string; duration: number };
type SeedAlbum = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  year?: number;
  buyUrl?: string;
  tracks: SeedTrack[];
};

const albums: SeedAlbum[] = [
  {
    slug: "in-peace-a-call-to-unity",
    title: "In Peace: A Call to Unity",
    description:
      "Devotional chants from around the world. This musical compilation invokes our common humanity and the ever-flowing blessing to all. Many of these chants are drawn from our favorite Sufi Dances of Universal Peace, a legacy from American Sufi mystic, Samuel Lewis.",
    cover: "/music/covers/in-peace-a-call-to-unity.webp",
    buyUrl: "https://northeastsufis.org/in-peace-a-call-to-unity/",
    tracks: [
      { title: "Quan Zeon Bosai", file: "01-quan-zeon-bosai.m4a", duration: 216 },
      { title: "Beauty Way", file: "02-beauty-way.m4a", duration: 201 },
      { title: "Ana Elna", file: "03-ana-elna.m4a", duration: 247 },
      { title: "Ruach", file: "04-ruach.m4a", duration: 380 },
      { title: "Ishe Oluwa", file: "05-ishe-oluwa.m4a", duration: 243 },
      { title: "Andalusian Zikr", file: "06-andalusian-zikr.m4a", duration: 362 },
      { title: "Darood", file: "07-darood.m4a", duration: 346 },
      { title: "Oxum", file: "08-oxum.m4a", duration: 223 },
      { title: "Sita Ram Nama Bhajo", file: "09-sita-ram-nama-bhajo.m4a", duration: 264 },
      { title: "Fatima's Gift", file: "10-fatima-s-gift.m4a", duration: 296 },
      { title: "Pour Upon Us", file: "11-pour-upon-us.m4a", duration: 173 },
      { title: "Om Tara", file: "12-om-tara.m4a", duration: 479 },
      { title: "Walking Peace", file: "13-walking-peace.m4a", duration: 289 },
      { title: "Peace Is Power", file: "14-peace-is-power.m4a", duration: 222 },
    ],
  },
  {
    slug: "voice-of-the-heart-remembering",
    title: "Voice of the Heart: Remembering",
    description:
      "This beautiful collection of devotional songs was inspired by remembrance of loved ones. All songs are composed by Abraham Sussman.",
    cover: "/music/covers/voice-of-the-heart-remembering.png",
    buyUrl: "https://northeastsufis.org/voice-of-the-heart-remembering-2/",
    tracks: [
      { title: "Coming Home", file: "01-coming-home.m4a", duration: 212 },
      { title: "Breath of God", file: "02-breath-of-god.m4a", duration: 192 },
      { title: "Murshid Rides", file: "03-murshid-rides.m4a", duration: 204 },
      { title: "Let There Be Beauty", file: "04-let-there-be-beauty.m4a", duration: 162 },
      { title: "Winning and Losing", file: "05-winning-and-losing.m4a", duration: 211 },
      { title: "Oh Great Spirit", file: "06-oh-great-spirit.m4a", duration: 417 },
      { title: "Healer Man (Karmu)", file: "07-healer-man.m4a", duration: 308 },
      { title: "Prophets' Zikr", file: "08-prophet-s-zikr.m4a", duration: 598 },
      { title: "On That Day", file: "09-on-that-day.m4a", duration: 241 },
      { title: "Spring", file: "10-spring.m4a", duration: 107 },
      { title: "Open Heart (Hazrat Pir Moineddin)", file: "11-open-heart.m4a", duration: 169 },
      { title: "Wild Goose", file: "12-wild-goose.m4a", duration: 386 },
    ],
  },
  {
    slug: "waters-of-life",
    title: "Waters of Life",
    description:
      "Songs and chants celebrating the waters of life, offered by Halima, Abraham, and friends from the SamaSangha community.",
    cover: "/music/covers/waters-of-life.png",
    year: 2022,
    buyUrl: "https://northeastsufis.org/waters-of-life/",
    tracks: [
      { title: "KC Bismillah — Halima Sussman", file: "01-kc-bismillah-halima-sussman-fattah-kriner-dance.m4a", duration: 174 },
      { title: "My Lord Is a Rock — Allaudin Ottinger", file: "02-my-lord-is-a-rock-allaudin-ottinger-zubeida-mitten-lewis.m4a", duration: 312 },
      { title: "Alastu — Halima", file: "03-alastu-halima-saadi-neil-douglas-klotz.m4a", duration: 170 },
      { title: "Shakti Ye — Abraham Sussman", file: "04-shakti-ye-abraham-sussman-halima-abraham.m4a", duration: 325 },
      { title: "Vilka Yaku — Arjun", file: "05-vilka-yaku-arjun-arjun-jorge-calero.m4a", duration: 380 },
      { title: "Ani Mahamin — Abraham", file: "06-ani-mahamin-abraham-halima-abraham.m4a", duration: 246 },
      { title: "Om Tare — Malika Elena Salazar", file: "07-om-tare-malika-elena-salazar-radha-cludia-cuman.m4a", duration: 99 },
      { title: "Returning — Halima", file: "08-returning-halima-halima.m4a", duration: 183 },
      { title: "Ixchel in the Rain — Malika", file: "09-ixchel-in-the-rain-malika-ayesha-lauenborg.m4a", duration: 207 },
      { title: "Armaiti Anahita — Khadija Goforth", file: "10-armaiti-anahita-khadija-goforth-khabir-kitz.m4a", duration: 192 },
      { title: "Butter Zikr — Maitreya", file: "11-butter-zikr-maitreya-maitreya-jon-stevens.m4a", duration: 255 },
      { title: "Steady On — Maitreya", file: "12-steady-on-maitreya-maitreya.m4a", duration: 146 },
      { title: "Allah Zikr / Subhan Allah — Halima", file: "13-allah-zikr-halima-halima-subhan-allah-halima-leilah-be.m4a", duration: 484 },
      { title: "Fill Your Cup — Allaudin", file: "14-fill-you-cup-allaudin-allaudin.m4a", duration: 450 },
    ],
  },
  {
    slug: "almighty-peace",
    title: "Almighty Peace",
    description:
      "All songs composed by Maitreya Jon Stevens, performed by Abraham, Halima, and friends of the Northeast Sufi community.",
    cover: "/music/covers/almighty-peace.png",
    buyUrl: "https://northeastsufis.org/almighty-peace/",
    tracks: [
      { title: "Zikr of the Groove", file: "01-zikr-of-the-groove-feat-halima-sophya-wendy-arif-nuradin-pre.m4a", duration: 232 },
      { title: "Butter Zikr", file: "02-butter-zikr-feat-abraham-halima-nuradin-arif-stan.m4a", duration: 399 },
      { title: "Steady on the Path", file: "03-steady-on-the-path-feat-abraham-arif-sophya.m4a", duration: 253 },
      { title: "Three Gifts", file: "04-three-gifts-feat-abraham-sophya-nuradin-arif-stan-halima-wen.m4a", duration: 342 },
      { title: "Cascading Zikr", file: "05-cascading-zikr-feat-halima-abraham-stan.m4a", duration: 281 },
      { title: "Kirtan Ram", file: "06-kirtan-ram-feat-stan-abraham-nuradin-halima-wendy-sophya.m4a", duration: 407 },
      { title: "Forgivemeness", file: "07-forgivemeness-feat-abraham-halima-stan-nuradin-sophya-wendy.m4a", duration: 536 },
      { title: "Mutu Qabla", file: "08-mutu-qabla-feat-abraham-halima-nuradin-sophya.m4a", duration: 345 },
      { title: "Almighty Peace", file: "09-almighty-peace-feat-halima-abraham-stan-arif-nuradin.m4a", duration: 400 },
    ],
  },
  {
    slug: "healing-love",
    title: "Healing Love",
    description:
      "Chants and songs of healing offered by the SamaSangha community — invoking compassion across traditions, from Kwan Zeon Bosal and Green Tara to Darood and the Medicine Buddha.",
    cover: "/music/covers/healing-love.png",
    year: 2025,
    buyUrl: "https://northeastsufis.org/healing-love/",
    tracks: [
      { title: "Mother of Compassion (Kwan Zeon Bosal)", file: "01-mother-of-compassion.m4a", duration: 216 },
      { title: "Fatima's Gift", file: "02-fatima-s-gift.m4a", duration: 296 },
      { title: "Ishe Oluwa", file: "03-ishe-oluwa.m4a", duration: 243 },
      { title: "Om Tara", file: "04-om-tara.m4a", duration: 479 },
      { title: "Healing Love", file: "05-healing-love.mp3", duration: 338 },
      { title: "Ruach", file: "06-ruach.m4a", duration: 380 },
      { title: "Shakti Ye", file: "07-shakti-ye.mp3", duration: 231 },
      { title: "Medicine Buddha Lotus Crown", file: "08-medicine-buddha-lotus-crown.mp3", duration: 465 },
      { title: "Ana Elna", file: "09-ana-elna.m4a", duration: 247 },
      { title: "Green Tara", file: "10-green-tara.m4a", duration: 316 },
      { title: "Keep My Faith", file: "11-keep-my-faith.mp3", duration: 243 },
      { title: "Darood", file: "12-darood.m4a", duration: 346 },
      { title: "Loka (May All Beings Be Well and Happy)", file: "13-loka.mp3", duration: 490 },
    ],
  },
  {
    slug: "zikr-of-the-heart",
    title: "Zikr of the Heart",
    description:
      "With Pir Shabda Kahn & Friends. Recorded live in Boston, April 2002 — a joyous collection of devotional chant and zikrs recorded during a SAMA retreat, with over 70 live voices and hearts joining in. Full album available by donation.",
    cover: "/music/covers/zikr-of-the-heart.jpeg",
    year: 2002,
    buyUrl: "https://northeastsufis.org/zikr-of-the-heart/",
    tracks: [{ title: "Album Sample", file: "01-album-sample.mp3", duration: 112 }],
  },
  {
    slug: "the-bridge",
    title: "The Bridge",
    description:
      "The Way of the Spiritual Traveller — a musical journey from the mystical traditions of the Middle East. A collaboration of Neil Douglas-Klotz, Abraham Sussman and friends, following the modern pilgrim's progress through the peaks and valleys of the spiritual path.",
    cover: "/music/covers/the-bridge.webp",
    buyUrl: "https://northeastsufis.org/albums/",
    tracks: [
      { title: "The Shepherd of Ripeness", file: "01-the-shepherd-of-ripeness.m4a", duration: 204 },
      { title: "The World Is a Bridge", file: "02-the-world-is-a-bridge.m4a", duration: 260 },
      { title: "Ave Maria in Aramaic", file: "03-ave-maria-in-aramaic.m4a", duration: 280 },
      { title: "A Blessing of Trust and Creation", file: "04-a-blessing-of-trust-and-creation.m4a", duration: 317 },
      { title: "Meeting Grief and Loss (Second Beatitude)", file: "05-meeting-grief-and-loss-second-beatitude.m4a", duration: 366 },
      { title: "Love Is as Strong as Death (Song of Songs)", file: "06-love-is-as-strong-as-death-song-of-songs.m4a", duration: 298 },
      { title: "A Blessing of Work and Rest", file: "07-a-blessing-of-work-and-rest.m4a", duration: 274 },
      { title: "A Prayer for All Healers (Darood)", file: "08-a-prayer-for-all-healers-darood.m4a", duration: 179 },
      { title: "Going Through and Further", file: "09-going-through-and-further.m4a", duration: 223 },
      { title: "Following in the Caravan (Ina D'tayeb, Jn 14:2)", file: "10-following-in-the-caravan-ina-d-tayeb-jn-14-2.m4a", duration: 287 },
      { title: "Ripeness for the Next Spiral of Life (Inana Raya Tauba, Jn 10:11)", file: "11-ripeness-for-the-next-spiral-of-life-inana-raya-tauba-jn-10.m4a", duration: 181 },
    ],
  },
  {
    slug: "beginnings",
    title: "Beginnings",
    description:
      "A Modern Oratorio inspired by the shared creation stories of the Middle East. A musical collaboration of Saadi Neil Douglas-Klotz, Abraham Sussman & friends — a meditation on Creation drawn from the Hebrew and Christian Bibles and the Quran, including the melodies of Saadi's Genesis Meditations cycle.",
    cover: "/music/covers/beginnings.webp",
    buyUrl: "https://northeastsufis.org/voice-of-the-heart-remembering/",
    tracks: [
      { title: "The Creative Word Resounding: Bereshita Itawa", file: "01-the-creative-word-resounding-bereshita-itawa.m4a", duration: 199 },
      { title: "The Story Begins: Bereshith Bara Elohim", file: "02-the-story-begins-bereshith-bara-elohim.m4a", duration: 188 },
      { title: "The Unformed Seed of Existence: Tohu Wa Bohu", file: "03-the-unformed-seed-of-existence-tohu-wa-bohu.m4a", duration: 182 },
      { title: "The Great Dark Rolls In: Wa Choshech", file: "04-the-great-dark-rolls-in-wa-choshech.m4a", duration: 256 },
      { title: "Breath and Darkness Make Love: Wa Ruach Elohim", file: "05-breath-and-darkness-make-love-wa-ruach-elohim.m4a", duration: 433 },
      { title: "Light Exists: Iehi Aor", file: "06-light-exists-iehi-aor.m4a", duration: 220 },
      { title: "Celebration of the Light: Wa Yira Elohim", file: "07-celebration-of-the-light-wa-yira-elohim.m4a", duration: 244 },
      { title: "Wisdom and Life Energy Embrace: Ya Qanani Re'shith", file: "08-wisdom-and-life-energy-embrace-ya-qanani-re-shith.m4a", duration: 233 },
      { title: "Wisdom Pours Herself Out: Me'olam Nissakhti", file: "09-wisdom-pours-herself-out-me-olam-nissakhti.m4a", duration: 435 },
      { title: "The Birth Dance of Holy Wisdom: Be'an Tehomot", file: "10-the-birth-dance-of-holy-wisdom-be-an-tehomot.m4a", duration: 225 },
      { title: "The First Remembrance: Alastu Bi-Rabbikum", file: "11-the-first-remembrance-alastu-bi-rabbikum.m4a", duration: 334 },
      { title: "In the Divine Image: Nahaseh Adam", file: "12-in-the-divine-image-nahaseh-adam.m4a", duration: 509 },
      { title: "For Better and Worse, Reigning with All Creation: Pherou", file: "13-for-better-and-worse-reigning-with-all-creation-pherou.m4a", duration: 394 },
      { title: "The Seventh Day: Wa Isheboth", file: "14-the-seventh-day-wa-isheboth.m4a", duration: 362 },
    ],
  },
];

async function main() {
  // Remove the old tracklist-only placeholder (superseded by the "beginnings" sample album)
  await prisma.album.deleteMany({ where: { slug: "beginnings-a-modern-oratorio" } });
  // Saladin is a spoken-word 4-CD set with no streamable audio — keep it unpublished
  await prisma.album.updateMany({
    where: { slug: "saladin-epic-poem" },
    data: { published: false },
  });

  for (const a of albums) {
    const album = await prisma.album.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        coverUrl: a.cover,
        year: a.year ?? null,
        buyUrl: a.buyUrl ?? null,
        published: true,
      },
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        coverUrl: a.cover,
        year: a.year ?? null,
        buyUrl: a.buyUrl ?? null,
        published: true,
      },
    });
    await prisma.track.deleteMany({ where: { albumId: album.id } });
    await prisma.track.createMany({
      data: a.tracks.map((t, i) => ({
        albumId: album.id,
        title: t.title,
        duration: t.duration,
        audioUrl: `/music/${a.slug}/${t.file}`,
        order: i + 1,
      })),
    });
    console.log(`✓ ${a.title} (${a.tracks.length} tracks)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
