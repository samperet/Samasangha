// Presentation metadata for the Teachers & Lineage section, keyed by Teacher.slug.
// Biographies live in the database (Teacher.bio); everything decorative
// (dates, role lines, pull-quotes, portraits, galleries) is versioned here.
// Photos are self-hosted under /public/assets/lineage/.

export type LineagePhoto = { src: string; alt: string; caption?: string };

export type LineageMeta = {
  dates?: string;        // "1882–1927", omitted for living teachers
  role: string;          // small-caps role line under the name
  quote?: { text: string; attribution: string };
  portrait: string;      // self-hosted portrait
  gallery?: LineagePhoto[];
};

export const LINEAGE_META: Record<string, LineageMeta> = {
  "hazrat-inayat-khan": {
    dates: "1882–1927",
    role: "Pir-o-Murshid · Founder of the Sufi Message in the West",
    quote: {
      text: "Truth is a divine inheritance found in the depth of every human heart.",
      attribution: "Hazrat Inayat Khan, Gayan",
    },
    portrait: "/assets/lineage/hazrat-inayat-khan.png",
    gallery: [
      { src: "/assets/lineage/hazrat-inayat-khan-vina.jpeg", alt: "Hazrat Inayat Khan playing the saraswati vina", caption: "With the saraswati vina; he came West first as a musician." },
      { src: "/assets/lineage/hazrat-inayat-khan-portrait.jpg", alt: "Portrait of Hazrat Inayat Khan", caption: "Pir-o-Murshid Hazrat Inayat Khan." },
    ],
  },
  "murshid-samuel-lewis": {
    dates: "1896–1971",
    role: "Murshid · Creator of the Dances of Universal Peace",
    quote: {
      text: "One of the reasons I am teaching this music and dancing is to increase Joy, not awe towards another person, but bliss in our own self. This is finding God within, through experience.",
      attribution: "Murshid Samuel Lewis",
    },
    portrait: "/assets/lineage/murshid-sam.png",
    gallery: [
      { src: "/assets/lineage/murshid-sam-1962.jpg", alt: "Murshid Samuel Lewis in robe and cap, 1962", caption: "Murshid Sam, 1962." },
      { src: "/assets/dancing-with-murshid-sam.jpeg", alt: "Dancing with Murshid Sam", caption: "Dancing with Murshid Sam." },
      { src: "/assets/lineage/murshid-sam-3.png", alt: "Murshid Samuel Lewis", caption: "“Eat, dance, and pray with the peoples of the world.”" },
    ],
  },
  "pir-moineddin-jablonski": {
    dates: "1942–2001",
    role: "Pir · Sufi Ruhaniat International, 1971–2001",
    quote: {
      text: "I am not Murshid; we are Murshid. I do not have all the answers; we may have the answers.",
      attribution: "Pir Moineddin Jablonski, Job's Tears",
    },
    portrait: "/assets/lineage/moineddin-1981.gif",
    gallery: [
      { src: "/assets/lineage/pir-moineddin.png", alt: "Moineddin Jablonski with Murshid Samuel Lewis", caption: "With his teacher, Murshid Sam." },
      { src: "/assets/lineage/moineddin-darshan-1979.gif", alt: "Pir Moineddin giving darshan, 1979", caption: "Darshan, 1979." },
    ],
  },
  "pir-shabda-kahn": {
    role: "Pir · Sufi Ruhaniat International, since 2001",
    quote: {
      text: "Here's a great line for everyone to practice in order to make friends with life: This is how it is right now.",
      attribution: "Pir Shabda Kahn",
    },
    portrait: "/assets/lineage/pir-shabda-kahn.png",
  },
  "abraham-sussman": {
    role: "Murshid · SamaSangha, Cambridge",
    quote: {
      text: "An awakened heart is contagious, and when a group practices together, the warmth and light are powerful agents of transformation.",
      attribution: "Murshid Abraham Sussman, “Dancing the Heart Awake”",
    },
    portrait: "/assets/lineage/abraham-sussman.png",
    gallery: [
      { src: "/assets/AbrahamDalilama.jpeg", alt: "Abraham Sussman with His Holiness the Dalai Lama", caption: "With His Holiness the Dalai Lama." },
      { src: "/assets/lineage/ahha-in-the-yurt.png", alt: "Abraham and Halima in the yurt", caption: "With Halima in the yurt, 2022." },
    ],
  },
  "halima-sussman": {
    role: "Murshida · SamaSangha, Cambridge",
    quote: {
      text: "When we radiate light, love, joy, and peace, it makes the world a better place. This is how we create Heaven on Earth.",
      attribution: "Murshida Halima Sussman, “Be Ye Songs of Glory”",
    },
    portrait: "/assets/lineage/halima-sussman.gif",
    gallery: [
      { src: "/assets/lineage/ahha-in-the-yurt.png", alt: "Halima and Abraham in the yurt", caption: "With Abraham in the yurt, 2022." },
    ],
  },
  "frida-waterhouse": {
    dates: "1907–1987",
    role: "Godparent of the lineage · Seer & spiritual counselor",
    quote: {
      text: "Your only spiritual path is how you live your life every moment of every day.",
      attribution: "Frida Waterhouse, as her students remember her",
    },
    portrait: "/assets/lineage/frida-waterhouse.png",
    gallery: [
      { src: "/assets/lineage/frida-with-sam.jpeg", alt: "Frida Waterhouse with Murshid Samuel Lewis", caption: "With Murshid Sam." },
      { src: "/assets/lineage/frida-waterhouse-3.gif", alt: "Frida Waterhouse", caption: "Frida Waterhouse." },
    ],
  },
  "karmu": {
    role: "Healer of Cambridge",
    portrait: "/assets/lineage/karmu-mechanic.png",
  },
};

// Display order for prev/next navigation on detail pages (mirrors Teacher.order).
export const LINEAGE_ORDER = [
  "hazrat-inayat-khan",
  "murshid-samuel-lewis",
  "pir-moineddin-jablonski",
  "pir-shabda-kahn",
  "abraham-sussman",
  "halima-sussman",
  "frida-waterhouse",
  "karmu",
];
