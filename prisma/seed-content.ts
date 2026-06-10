import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

// ─── helpers ────────────────────────────────────────────────────────────────

function p(...lines: string[]) {
  return lines.map((l) => `<p>${l}</p>`).join("\n");
}
function h2(text: string) {
  return `<h2>${text}</h2>`;
}
function blockquote(text: string) {
  return `<blockquote><p>${text}</p></blockquote>`;
}
function ul(...items: string[]) {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

// ─── teachers ───────────────────────────────────────────────────────────────

const teachers = [
  {
    name: "Halima",
    slug: "halima-sussman",
    order: 1,
    published: true,
    bio:
      p(
        "Murshida Halima is a senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace lineages, an inspired musician, and an experienced guide in the path of the awakening heart.",
        "Halima seeded her love of the Sufi path in Murshid Sam's Marin Dance Meeting. She shares joy and clarity arising from her own practice and taps a depth that arises from a lifetime of integrating spiritual practice, psychological exploration, and a love of the natural world.",
        "Together with Abraham, Halima has traveled to Russia, Colombia, Ecuador, Mexico, New Zealand, Australia, Holland, Latvia, and Spain — bringing the Dances of Universal Peace and Sufi teachings to communities worldwide."
      ),
  },
  {
    name: "Abraham",
    slug: "abraham-sussman",
    order: 2,
    published: true,
    bio:
      p(
        "Murshid Abraham is an original mureed of Murshid Samuel Lewis. He is a senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace lineages, an inspired musician, and an experienced guide in the path of the awakening heart.",
        "As a young wanderer in 1969, Abraham first met his spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco. He has been leading gatherings of the Dances of Universal Peace in Cambridge, Massachusetts since 1972 — where Murshid Sam first brought the dances in 1969.",
        "Abraham travels and teaches internationally, returning home to Massachusetts, local family, and sangha."
      ),
  },
  {
    name: "Hazrat Inayat Khan",
    slug: "hazrat-inayat-khan",
    order: 3,
    published: true,
    bio:
      p("1882–1927") +
      blockquote(
        "Open our hearts, that we may hear thy voice, which constantly comes from within. Disclose to us Thy Divine Light, which is hidden in our souls, that we may know and understand life better."
      ) +
      p(
        "Hazrat Inayat Khan was asked by his spiritual teacher to unite the East and West through his music and to bring the ideals of spiritual and religious unity to the western world. His teachings and message continue to be cultivated today through several Sufi branches, one of which is the Sufi Ruhaniat International."
      ) +
      blockquote(
        "Sufism is the religion of the heart. The religion in which the most important thing is to seek God in the heart of mankind. — Hazrat Inayat Khan, Gathekas"
      ),
  },
  {
    name: "Murshid Samuel Lewis",
    slug: "murshid-samuel-lewis",
    order: 4,
    published: true,
    bio:
      p(
        "Murshid Samuel Lewis's life stands as proof that spiritual realization transcends all sectarian barriers. Along with his first Sufi teacher Hazrat Pir-o-Murshid Inayat Khan, and mentors Swami Papa Ramdas, Mataji Krishnabai, Sensei Nyogen Senzaki, and other illuminated souls, he sought to answer the cry of humanity by the sharing of spiritual teachings and practices, as well as by his own awakened presence.",
        "Murshid Sam was an accomplished gardener who worked to alleviate world hunger. To heal the wounds of violence and war, he received a simple yet profound peace program from the spirit of Jesus:"
      ) +
      blockquote("Eat, Dance, and Pray with the peoples of the world.") +
      p(
        "In 1970, when Murshid Sam visited the Northeast, bringing teachings and Sufi dancing to Cambridge, MA, he was accompanied by his young student Shabda. The Dances of Universal Peace he created are now practiced in almost every country on earth.",
        "Murshid Sam was succeeded by Pir Moineddin Jablonski, who served as spiritual director of the Sufi Ruhaniat International from 1971 through 2000."
      ) +
      blockquote(
        "The Sufi not only prays to God, the Sufi represents God. By this I mean that one not only asks for Love and Wisdom and Joy and Peace, one does everything possible to awaken Love and Light and Wisdom and Joy and Peace in others. — Murshid Samuel Lewis, Diary, December 1, 1967"
      ),
  },
  {
    name: "Pir Moineddin Jablonski",
    slug: "pir-moineddin-jablonski",
    order: 5,
    published: true,
    bio:
      p(
        "Pir Moineddin assumed leadership of the Ruhaniat in 1971 upon the death of Murshid Samuel Lewis. Continuing his teacher's vision, Pir Moineddin oversaw the spread of the Sufi Message of Love, Harmony, and Beauty through spiritual practice, the Dances of Universal Peace, the Healing work, SoulWork counseling, and conscious community involvement. The Ruhaniat grew from some 150 people to a worldwide network of Sufi communities throughout forty-two states, and in countries across Europe, Asia, South America, and Australasia.",
        "Moineddin shepherded the individuation of the Ruhaniat from the Sufi Order International in 1977, affirming the practice of Murshid SAM that the living relationship between Sufi mureed and guide was more important than any attempt to impose organizational rules on the relationship. He instituted ethical guidelines and an ethics procedure in the Ruhaniat in the early 1980s.",
        "Along with Pir Hidayat Inayat Khan of the International Sufi Movement, Moineddin cultivated the foundation and establishment of the Federation of the Sufi Message, which now includes a number of other lineages of Sufi work that stem from the inspiration of Hazrat Inayat Khan."
      ) +
      blockquote(
        "I am not Murshid; we are Murshid. I do not have all the answers; we may have the answers."
      ) +
      blockquote(
        "The breath is enough, the heart is enough, the eye is enough, the atmosphere is enough."
      ) +
      p(
        "Pir Moineddin was a great uniter, a man of tremendous heart and great humor who worked steadfastly on behalf of the greater good of all."
      ),
  },
  {
    name: "Pir Shabda Kahn",
    slug: "pir-shabda-kahn",
    order: 6,
    published: true,
    bio:
      p(
        "On February 27, 2001, Shabda Kahn was appointed Pir (lineage holder) of the Sufi Ruhaniat International in the stream of the great mystic Hazrat Inayat Khan, his disciple Murshid Samuel Lewis, and his successor Pir Moineddin Jablonski.",
        "Shabda was initiated by Murshid Samuel Lewis on February 16, 1970. In the Fall of 1970, Shabda traveled with Murshid for five weeks as his personal assistant on the East Coast. A month later, Murshid Sam fell and died several weeks after — a morning Shabda was present for.",
        "Shabda met his second great teacher, Pandit Pran Nath, in 1972, and began the daily practice of North Indian Classical vocal music in the Kirana style, following in the footsteps of Hazrat Inayat Khan. Pran Nath planted an 800-year-old oral tradition of Chisti Sufi Vocal Music in the Western World and requested that Shabda carry on the lineage teaching under the name of the Chisti Sabri School of Music.",
        "Pir Shabda travels worldwide, teaching and bringing the message of spiritual unity through the expression of Love, Harmony and Beauty."
      ),
  },
  {
    name: "Frida Waterhouse",
    slug: "frida-waterhouse",
    order: 7,
    published: true,
    bio:
      h2("A Brief Autobiography") +
      p(
        "The amanuensis, Frida Waterhouse, was born of Jewish parents on October 12, 1907, at Gloversville, New York.",
        "She moved from Los Angeles to San Francisco under spiritual guidance in July 1963. A part of her genetic inheritance developed into cataracts in both eyes. Eventually she became blind to all but light and darkness because she would not submit to surgery for a period of about four and one-half years — requested by the Divine Ones in order that she might develop more inner sensitivities. Once she became an instrument with the skills required for her special work, her eyes developed acute glaucoma and surgery became imperative. Her sight was successfully restored.",
        "Her work is primarily to provide a practical springboard that others can use to help them work through compulsive, reactive emotional patterns that can lead to mastery over themselves. She is a channel that invokes spiritual force fields in order to confirm data already received by others."
      ),
  },
  {
    name: "Karmu",
    slug: "karmu",
    order: 8,
    published: true,
    bio:
      p(
        "Karmu gave herbal medicines to everyone who came to see him. In 1968, there were not health food stores in every major city — Karmu's practice was extraordinary for its time. His most used herbs were aloes, goldenseal, valerian, snakesroot, Life Everlasting — these were the backbone of his \"black\" medicine.",
        "Abraham remembers Karmu as Murshid Sam's \"Black Christ\" — a healer who turned no one away. The song \"Healer Man (Karmu)\" on the album Voice of the Heart: Remembering was written in 1981 in his memory.",
        "A documentary, Karmu: A Place in the Sun, tells his story."
      ),
  },
];

// ─── pages ──────────────────────────────────────────────────────────────────

const pages = [
  {
    slug: "our-story",
    title: "Our Story",
    content:
      p(
        "SamaSangha is the community of seekers who have gathered in Massachusetts, and also far and wide, with the guidance of Sufi Murshids Halima and Abraham.",
        "In the Sufi Ruhaniat lineage of Pir-o-Murshid Hazrat Inayat Khan and Murshid Samuel Lewis our sangha supports our collective realization that love, harmony, and beauty are the foundation of spiritual life. Tuning to the interconnected nature which unites all of creation, our practice serves the protection of all life on Earth.",
        "Since 1972 Halima and Abraham have been leading gatherings of the Dances of Universal Peace in Cambridge Massachusetts, where Murshid Sam first brought the dances in 1969. Sama — which refers to the sacred dance and music — is the name of our center and our sangha includes our many friends who have shared these practices with us.",
        "In recent years Halima and Abraham have traveled to Russia, Colombia, Ecuador, Mexico, New Zealand, Australia, Holland, Latvia, and Spain, and the many friends they have made around the world have also become part of SamaSangha.",
        "Through regular in-person and online teachings and gatherings, this sangha continues to grow."
      ),
  },
  {
    slug: "lineage",
    title: "Our Lineage",
    content:
      p(
        "Our community is rooted in the Universal Sufi heart stream of Pir-O-Murshid Hazrat Inayat Khan and Murshid Samuel Lewis. SAMA serves as a branch of the Sufi Ruhaniat International, and as a hub for The Dances of Universal Peace.",
        "The Ruhaniat lineage flows: Hazrat Inayat Khan → Murshid Samuel Lewis → Pir Moineddin Jablonski → Pir Shabda Kahn (current Pir). Halima and Abraham received their initiation and transmission directly from Murshid Samuel Lewis."
      ),
  },
  {
    slug: "tuesday-practice",
    title: "Tuesday Practice",
    content:
      h2("Weekly Tuesday Practice with Abraham, Halima and Sama Sangha") +
      p(
        "Join us Tuesday Mornings for Sufi Practice & Meditation beginning at <strong>9AM EST</strong> (Boston MA, USA). We continue to advocate for actions and realizations that support a harmonious relationship between people, nature, and life itself, knowing that this realization begins inside ourselves. Our intentions are towards 7 generations, towards Peace on Earth.",
        "Please arrive a few minutes early so we can begin together. Our practice time is approximately 45 minutes long.",
        "<strong>Practice is free</strong>, but there are costs associated with gathering our beloved community, including digital platforms, Zoom costs, faculty support, and more. Feel free to support us with a dana (donation).",
        "Sign up to receive a reminder email for upcoming classes, or email <a href=\"mailto:northeastsufis@gmail.com\">northeastsufis@gmail.com</a> to inquire about joining our ongoing weekly practice."
      ),
  },
  {
    slug: "dances",
    title: "Dances of Universal Peace",
    content:
      h2("Live Dances of Universal Peace in Cambridge!") +
      p(
        "<strong>Third Saturdays of the month</strong><br>7:15pm (doors open) · 7:30pm – 9:45pm<br><br>Friends Meeting House (in the Friends Room)<br>5 Longfellow Park, Cambridge, MA 02138<br><br>SamaSangha with Halima, Abraham & Friends. A contribution of <strong>$10–15</strong> is kindly requested."
      ) +
      p(
        "Dances of Universal Peace are part of the timeless tradition of body prayer and sacred dance. Singing and moving together, we embrace the Unity at the heart of all paths to the Source.",
        "The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International for the benefit of all people.",
        "The Dances of Universal Peace and Walking Concentrations are spiritual practice in motion. Drawing on the sacred phrases, scripture, and poetry of the many spiritual traditions of the earth, the Dances blend chant, live music and evocative movement into a living experience of unity, peace and integration."
      ),
  },
  {
    slug: "dances-cambridge",
    title: "Dances in Cambridge",
    content:
      p(
        "Cambridge Dances of Universal Peace gather on the <strong>third Saturday of every month</strong>.",
        "7:15pm doors open · 7:30–9:45pm practice<br>Friends Meeting House (in the Friends Room)<br>5 Longfellow Park, Cambridge, MA 02138<br>Suggested contribution: $10–15"
      ) +
      p(
        "Led by SamaSangha with Halima, Abraham & Friends. All are welcome — no experience required.",
        "To be added to the mailing list for announcements, please contact us or sign up below."
      ),
  },
  {
    slug: "deepening",
    title: "Deepening — Mureeds' Class",
    content:
      p(
        "The Deepening program is an ongoing study and practice for initiated mureeds (students) of the Sufi Ruhaniat International.",
        "This includes the God is Breath course and other structured teachings offered by Abraham and Halima to the inner circle of practitioners."
      ),
  },
];

// ─── posts ───────────────────────────────────────────────────────────────────

const posts = [
  // ── DHARMA GEMS ──
  {
    title: "Dharma Gem: River of Guidance, A Musical Feast 2026",
    slug: "dharma-gem-river-of-guidance-2026",
    category: "DHARMA_GEM" as const,
    excerpt: "Abraham and Halima with Petaluma Livelli and Khusrau Tom Lena share a musical dharma gem.",
    content: p("A musical feast and dharma gem with Abraham and Halima, Petaluma Livelli and Khusrau Tom Lena. A video teaching from the sangha's ongoing weekly practice."),
    published: true,
    publishedAt: new Date("2026-01-01"),
  },
  {
    title: "Dharma Gem: Halima reads from Jack Kornfield",
    slug: "dharma-gem-kornfield-2022",
    category: "DHARMA_GEM" as const,
    excerpt: "Halima reads from a Jack Kornfield poem — August 5, 2022.",
    content: p("Halima reads from Jack Kornfield poem. August 5, 2022."),
    published: true,
    publishedAt: new Date("2022-08-05"),
  },
  {
    title: "'God is Breath' Reflection",
    slug: "god-is-breath-reflection",
    category: "DHARMA_GEM" as const,
    excerpt: "What draws me to participate in 'God is Breath' at this time — and what I hope to gain from these practices.",
    content:
      p(
        "We thought it would be nice to create a place for our prayer circle to share contemplations, experiences, questions, etc. as we go through 'God is Breath' together. If you feel inspired to share a writing, poetry, or artwork send it to Shakti and she'll add it to this page. And please feel free to comment."
      ) +
      p(
        "I'll start by sharing what is drawing me (Dahlia Sura) to participate in 'God is Breath' at this time and what I hope to gain from these practices."
      ) +
      p(
        "I've been an active meditator (and meditation counselor) for more than forty years. In the past several years I've been noticing that I am increasingly more distractible. It's harder to stay focused and my concentration just isn't as good as it used to be. Ah, the aging brain.",
        "I know that the best solution to this jumpy, scattered mind-state is to practice more concentration/focus. So, this 'God is Breath' course is a perfect opportunity for me right now. I'm looking forward to both the daily, structured practices and to the support and encouragement that is inherent in our Sangha.",
        "When I look back at the past year I can see the great benefit I got from attending the SAMA Sufi Sesshins. The alternating format of doing a dance/practice and then sitting quietly in meditation really works well for me. I've been taking that format into my daily life by interspersing whatever activities I have on my to-do list with stopping for periods of quiet focus on the breath.",
        "My grandchildren were with me for an overnight on Saturday and they slept upstairs, in their own bed, for the first time. As I lay in my bed waiting for the next time that Leif, my 3½ year-old grandson, would awaken to call for me, I felt and sang the wazifa, Ya Raqib. It was such a beautiful, living experience of the watchful, loving awareness that we are practicing together.",
        "How about you? Why are you here? What do you hope/intend to strengthen or let go of? Let's evoke our intentions."
      ) +
      p("<em>— Dahlia Sura, February 2023</em>"),
    published: true,
    publishedAt: new Date("2023-02-01"),
  },
  {
    title: "'Toward the One, United With All'",
    slug: "toward-the-one-united-with-all",
    category: "DHARMA_GEM" as const,
    excerpt: "Waking up, making coffee, and heading to my altar, I feel overwhelming gratitude for the blessings of these practices.",
    content:
      p(
        "Waking up, making coffee, and heading to my altar, I feel overwhelming gratitude for the blessings of these practices. It's a gift to be on this journey — on my own, with my partner who sometimes can connect to practice with me, with this group of spiritual seekers. It is a blessing to have living/loving teachers who stand as guides in support of our awakening.",
        "As I light this candle, I feel my bones and sense your commitment to lighting your candle; I think about seekers all around the world and through all time — an embodied sense of interconnectedness as I ignite this flame and speak the invocation. We're following in the footsteps of our lineage caravan.",
        "During my meditation today, I focused on the phrase 'Toward the One – United with All' and switched my usual breath pattern. Instead of inhaling pointing out — Toward the One, I breathe inward — Toward the One, and invisible hands embrace my heart — front and back pressing inward, inviting me to integrate more fully into myself. A glowing thread of awareness points me to the phrase, 'The Embodiment of the Master.' The call to move toward mastery… a long way to go, but that's the invitation.",
        "For my exhale, I reach outward 'United with All,' and an echo comes resonating back to me, the phrase, 'United with All the Illuminated Souls.'",
        "Gifted a sense of protection, I extend and reach beyond my home, city, and planet… beyond, beyond the beyond — to the all-pervading life in space. And remember, I am a speck of life in a gigantic universe, embodying this heart, mind, and soul.",
        "As I finish meditation and enter the busy day, I try to hold on in remembrance of these momentary awarenesses.",
        "Good thing it's a year-long training +++"
      ) +
      p("<em>— Shakti, February 2023</em>"),
    published: true,
    publishedAt: new Date("2023-02-25"),
  },
  {
    title: "A Divine Inner Flash",
    slug: "a-divine-inner-flash",
    category: "DHARMA_GEM" as const,
    excerpt: "A Divine Inner Flash — a lifetime in the unfurling.",
    content:
      p(
        "<em>A Divine Inner Flash (a lifetime in the unfurling).</em>",
        "It's more of an unfurling than an unfolding, the Soul. I picture a chameleon's tail spiraling at will…",
        "As I was doing walking practice with Toward the One on the breath in the delicious cold spring air moving in and out like the sweetest nectar I had the epiphany of my lifelong ability to spiral inward into a depth unimaginable to the rational self. I realized in that moment there was NoThing stopping my soul from spiraling outward in that moment of Being in the One. In that very revelation a fully emerged Tiger Swallowtail brushed by me in the sunshine!"
      ) +
      p("<em>— Tarana Wesley, April 2023</em>"),
    published: true,
    publishedAt: new Date("2023-04-11"),
  },

  // ── TALKS ──
  {
    title: "2024 European Ruhaniat Jamiat Ahm — Lauterbach, Germany",
    slug: "jamiat-ahm-2024",
    category: "TALK" as const,
    excerpt: "Gems from Abraham and Halima's talks at the international gathering of the Ruhaniat Family in Germany.",
    content:
      h2("An international gathering of the Ruhaniat Family") +
      p(
        "Guest teachers this year, Halima and Abraham, teach and inspire people worldwide. They and other Ruhaniat teachers offered various sessions with Dance, Music, Meditation, Peacework, Soulwork, Healing Prayer and Ziraat. There was also space for personal exchange, questions and answers."
      ),
    published: true,
    publishedAt: new Date("2024-10-01"),
  },
  {
    title: "2023 European Ruhaniat Jamiat Ahm — Lauterbach, Germany",
    slug: "jamiat-ahm-2023",
    category: "TALK" as const,
    excerpt: "Abraham and Halima as guest teachers at the 2023 gathering, with focus on astrological walks of Murshid Samuel Lewis.",
    content:
      h2("An international gathering of the Ruhaniat Family") +
      p(
        "This year's guest teachers Halima and Abraham teach and inspire people all over the world. In addition to the Dances and Sufi teachings, there was also a focus on the astrological walks of Murshid Samuel Lewis.",
        "The program focused on different ways our theme \"inner and outer peace\" can be expressed. There were workshops with dances, music, meditation, soulwork, peace work and ziraat, and personal sharing, questions and answers."
      ),
    published: true,
    publishedAt: new Date("2023-09-01"),
  },
  {
    title: "Allah Huma Salle Allah Nuru Zaleme",
    slug: "nuru-zaleme-2019",
    category: "TALK" as const,
    excerpt: "We create a positive magnetic field on a daily basis when we tune ourselves Toward the One, and share practices together.",
    content:
      p(
        "We create a positive magnetic field on a daily basis when we tune ourselves Toward the One, and share practices together."
      ) +
      p(
        "<strong>YA NUR.</strong> All Pervading Reality whose aspect is Divine Light, which is the Substance of the Beloved. Recite 33x or 101x out loud, then on the breath infusing oneself with light.",
        "Darood from Barkat Ali, one of 4 given to Murshid Sam for his own practice. This musical version is from Murshid Saadi. <em>Allah huma salle allah nuru zalame.</em>",
        "We put Divine Light into places of contraction, tension, injustice and imbalance."
      ) +
      p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/10/Nuru-Zaleme.mp3\"></audio>"),
    published: true,
    publishedAt: new Date("2019-01-01"),
  },

  // ── DANCE ARTICLES ──
  {
    title: "Dancing the Heart Awake",
    slug: "dancing-the-heart-awake",
    category: "DANCE_ARTICLE" as const,
    excerpt: "As a young wanderer in 1969, I first met my spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco.",
    content:
      p("<em>This article continues our Elements of Mastery column in which we explore the art, craft and spiritual practice of Dance leading and mentoring.</em>") +
      p(
        "As a young wanderer in 1969, I first met my spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco. I realized quickly that life was taking me on an extraordinary adventure, and that my primary task was simply to be open, to listen, and to welcome the awesome blessings that were pouring forth from this God-realized dervish. I embraced the dances he shared with us as opportunities for ecstasy and as pathways to higher consciousness. I loved the community drawn together around this unpredictable, funny and wise elder. Adorned in our colorful robes, I experienced beauty in each and all of the dancers, and spiritually, I felt I was arriving home.",
        "Now, more than forty years later, I feel the same yearning for ecstasy and the genuine awakening of my heart. Whether I am leading a dance, playing music for a dance, or dancing a dance, I recognize that with every step, and every breath, the transformative potential of this sacred practice is powerful beyond limits."
      ) +
      p(
        "In considering ecstasy and devotion, we are talking about the inner life, what Hazrat Inayat Khan calls the realm of \"vibrations.\" Heart-awakening means just that: the awakening of our hearts from the stupor of isolation, disconnection, and fear, to become alive in the magnetism of spiritual realization. HIK also teaches us that the essential ailment of the human condition, from which all other illnesses and imbalances arise, is a \"coldness of heart.\" Thus, our warm embrace of the Beloved, in whatever form, brings healing to our hearts and lives."
      ) +
      h2("Elements of Mastery in Dance Leadership") +
      ul(
        "<strong>Solar Radiance</strong> — being positive in one's offering, confident in one's direct link to one's teachers and lineage teachings.",
        "<strong>Embodiment</strong> — giving one's embodied focus to the practice. \"Left foot, right foot\" — the Dances call us from distractions of mind-mesh into the vibrancy of embodied presence.",
        "<strong>Calm abiding</strong> — relaxing into the practice, which naturally encourages everyone in the circle to be relaxed and engaged.",
        "<strong>Fana</strong> — being effaced of one's own personality, devoting oneself to the practice, and tuning to the needs of the group."
      ) +
      p(
        "The training of Dance Leaders mostly involves our own training in spiritual practice. The elements of mastery described above are not learned from a book. They involve our own experience, as Dance Leaders, of the awakening, from within, of our own hearts. As Rumi says: \"Close the language door. Open the love window.\""
      ) +
      p("<em>— Murshid Abraham</em>"),
    published: true,
    publishedAt: new Date("2025-03-25"),
  },
  {
    title: '"Be Ye Songs of Glory"',
    slug: "be-ye-songs-of-glory",
    category: "DANCE_ARTICLE" as const,
    excerpt: "The Walks and Dances of Universal Peace are an exquisite vehicle for the transformative spiritual awakening to our true nature.",
    content:
      p(
        "The Walks and Dances of Universal Peace are an exquisite vehicle for the transformative spiritual awakening to our true nature. In the Dances we overcome isolation and the illusion of our separate individual states, and join together in the experience of our shared humanity. All people have words and expressions for love, compassion, peace, and joy. The Walks and Dances offer us a medium to experience and open to these kind of qualities that are, in reality, always present."
      ) +
      blockquote(
        "The dance is the way of Life; the dance is the sway of Life. What Life gives may be expressed with body, heart, and soul to the glory of God and the elevation of humankind, leading therein to ecstasy and self realization. Verily, this is the sacred dance. — Murshid SAM, Intro to Spiritual Dancing"
      ) +
      blockquote(
        "When mankind, terrorized by conflict and faced with the ruin of civilization, when the power of wealth has dominated justice… let us, in spite of what occurs before our eyes invoke that same Divine Spirit through love and beauty, that we may restore order and balance to humanity. — Murshid SAM"
      ) +
      p(
        "In this light, The Walks and Dances of Universal Peace are an active, positive, and powerful agent of change and transformation. As dance leaders, we cultivate and develop the capacity to become conduits for such transformative experience.",
        "In this way, the Dances, and leading the Dances are a spiritual practice. When we activate our breath and hearts, when we open to compassion, mercy and love, strength, courage, joy, and peace, these energies move through us and can open in us.",
        "We could also call this process the cultivation of effacement — the capacity to surrender our own ego, and our own sense of self-importance. Sufis call this act of surrender \"fana\", which is a similar state to what Buddhists call \"cultivating emptiness.\" In this state of fana, a dance leader becomes a vessel, receptive to the ever-present flow of blessing."
      ) +
      p("<em>— Murshida Halima</em>"),
    published: true,
    publishedAt: new Date("2025-03-25"),
  },

  // ── DANCE INTERVIEW ──
  {
    title: "Interview with Halima and Noor with Arjun",
    slug: "interview-halima-noor-arjun",
    category: "DANCE_INTERVIEW" as const,
    excerpt: "The first interview of a series presenting senior mentors of the Dances of Universal Peace International Network, exploring the training of dance leaders.",
    content:
      p(
        "The first interview of a series presenting senior mentors of the Dances of Universal Peace International Network, exploring the subject of the training of dance leaders.",
        "Halima and Noor are interviewed by Arjun in this inaugural conversation from the DUP leadership training series."
      ),
    published: true,
    publishedAt: new Date("2025-03-11"),
  },

  // ── ORIGINAL DANCES ──
  ...[
    {
      title: "Almighty Peace",
      slug: "original-dance-almighty-peace",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Almighty-Peace.mp3\"></audio>"),
    },
    {
      title: "Andalusian Zikr",
      slug: "original-dance-andalusian-zikr",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Andalusian-Zikr.mp3\"></audio>"),
    },
    {
      title: "Ani Mahamin",
      slug: "original-dance-ani-mahamin",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Ani-Mahamin.mp3\"></audio>"),
    },
    {
      title: "Fatima's Gift",
      slug: "original-dance-fatimas-gift",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Fatimas-Gift.mp3\"></audio>"),
    },
    {
      title: "Healing Love",
      slug: "original-dance-healing-love",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Healing-Love.mp3\"></audio>"),
    },
    {
      title: "Lokah Samastah",
      slug: "original-dance-lokah-samastah",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Lokah-Samastah.mp3\"></audio>"),
    },
    {
      title: "Ruach",
      slug: "original-dance-ruach",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Ruach.mp3\"></audio>"),
    },
    {
      title: "Shakti Ye",
      slug: "original-dance-shakti-ye",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Shakti-Ye.mp3\"></audio>"),
    },
    {
      title: "Zimbabwe Zikr",
      slug: "original-dance-zimbabwe-zikr",
      excerpt: "An original dance by Abraham & Halima.",
      content: p("An original dance by Abraham & Halima.") + p("<audio controls src=\"https://northeastsufis.org/wp-content/uploads/2022/09/Zimbabwe-Zikr.mp3\"></audio>"),
    },
  ].map((d) => ({
    ...d,
    category: "ORIGINAL_DANCE" as const,
    published: true,
    publishedAt: new Date("2022-09-01"),
  })),
];

// ─── albums ──────────────────────────────────────────────────────────────────

const albums = [
  {
    title: "In Peace: A Call to Unity",
    slug: "in-peace-a-call-to-unity",
    description:
      "Devotional Chants From Around the World. This musical compilation invokes our common humanity and the ever flowing blessing to all. Many of these chants are drawn from our favorite Sufi Dances of Universal Peace, a legacy from American Sufi mystic, Samuel Lewis.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Sample", order: 1, audioUrl: "https://northeastsufis.org/wp-content/uploads/2022/05/sama2-online-audio-converter.com_.mp3", duration: null },
    ],
  },
  {
    title: "Beginnings: A Modern Oratorio",
    slug: "beginnings-a-modern-oratorio",
    description:
      "A Modern Oratorio inspired by the Shared Creation Stories of the Middle East. Musical Collaboration: Saadi Neil Douglas-Klotz, Abraham & Friends. This CD is a musical expression of the shared creation stories of the Bibles (Hebrew and Christian) and the Quran.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Overture", order: 1, audioUrl: null, duration: null },
      { title: "The Story Begins (Bereshith bara elohim)", order: 2, audioUrl: null, duration: null },
      { title: "The Unformed Seed of Existence (wa ha'aretz hayta)", order: 3, audioUrl: null, duration: null },
      { title: "The Great Dark Rolls In (wa choshech)", order: 4, audioUrl: null, duration: null },
      { title: "Breath and Darkness Make Love (wa ruach elohim)", order: 5, audioUrl: null, duration: null },
      { title: "Light Is! (wa iyyomer elohim)", order: 6, audioUrl: null, duration: null },
      { title: "Celebration of the Light (wa yi'ra elohim)", order: 7, audioUrl: null, duration: null },
      { title: "Wisdom and Life Energy Embrace (Ya qanani re'shith)", order: 8, audioUrl: null, duration: null },
      { title: "Wisdom Pours Herself Out (Me'olam nissakhti)", order: 9, audioUrl: null, duration: null },
      { title: "The Birth Dance of Holy Wisdom (Be'en tehomot)", order: 10, audioUrl: null, duration: null },
      { title: "The First Remembrance (Alastu bi-rabbikum)", order: 11, audioUrl: null, duration: null },
      { title: "In the Divine Image (Nahaseh adam)", order: 12, audioUrl: null, duration: null },
      { title: "Reigning with All Creation (Pherow wa rebou)", order: 13, audioUrl: null, duration: null },
      { title: "The Seventh Day (Wa isheboth)", order: 14, audioUrl: null, duration: null },
    ],
  },
  {
    title: "Voice of the Heart: Remembering",
    slug: "voice-of-the-heart-remembering",
    description:
      "A beautiful collection of devotional songs inspired by remembrance of loved ones. All songs composed by Abraham.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Coming Home", order: 1, audioUrl: null, duration: null },
      { title: "Breath of God", order: 2, audioUrl: null, duration: null },
      { title: "Murshid Rides (Murshid SAM)", order: 3, audioUrl: null, duration: null },
      { title: "Let There Be Beauty", order: 4, audioUrl: null, duration: null },
      { title: "Winning and Losing", order: 5, audioUrl: null, duration: null },
      { title: "Oh Great Spirit", order: 6, audioUrl: null, duration: null },
      { title: "Healer Man (Karmu)", order: 7, audioUrl: null, duration: null },
      { title: "Prophets' Zikr", order: 8, audioUrl: null, duration: null },
      { title: "On That Day", order: 9, audioUrl: null, duration: null },
      { title: "Spring", order: 10, audioUrl: null, duration: null },
      { title: "Open Heart (Hazrat Pir Moineddin)", order: 11, audioUrl: null, duration: null },
      { title: "Wild Goose", order: 12, audioUrl: null, duration: null },
    ],
  },
  {
    title: "Zikr of the Heart",
    slug: "zikr-of-the-heart",
    description:
      "A joyous collection of Devotional Chant and Zikrs recorded live in Boston, April 2002, during a SAMA retreat with Pir Shabda Kahn. Over 70 live voices and hearts joining in! With Pir Shabda Kahn & Friends.",
    coverUrl: null,
    year: 2002,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Opening Bismillah", order: 1, audioUrl: "https://northeastsufis.org/wp-content/uploads/2022/09/Zikr-of-the-Heart-1.mp3", duration: null },
      { title: "Breathing Zikr", order: 2, audioUrl: null, duration: null },
      { title: "Hijaz Scale Zikr", order: 3, audioUrl: null, duration: null },
      { title: "Sahara Zikr", order: 4, audioUrl: null, duration: null },
      { title: "Zikr of Yearning (Firdousi)", order: 5, audioUrl: null, duration: null },
      { title: "Fez Zikr", order: 6, audioUrl: null, duration: null },
      { title: "Three-part Bismillah", order: 7, audioUrl: null, duration: null },
      { title: "Moroccan Qadiri Zikr", order: 8, audioUrl: null, duration: null },
      { title: "Sweet Zikr in Major Scale", order: 9, audioUrl: null, duration: null },
      { title: "Turning Zikr", order: 10, audioUrl: null, duration: null },
      { title: "Zikr of the Morning Breeze", order: 11, audioUrl: null, duration: null },
      { title: "May All Beings Be Well", order: 12, audioUrl: null, duration: null },
    ],
  },
  {
    title: "Almighty Peace",
    slug: "almighty-peace",
    description:
      "All songs composed by Maitreya Jon Stevens. A devotional collection of sacred chant.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Almighty Peace (sample)", order: 1, audioUrl: "https://northeastsufis.org/wp-content/uploads/2022/09/Almighty-Peace.mp3", duration: null },
    ],
  },
  {
    title: "Waters of Life",
    slug: "waters-of-life",
    description: "A devotional recording from SamaSangha.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Sample", order: 1, audioUrl: "https://northeastsufis.org/wp-content/uploads/2022/12/Waters-of-Life-sample.mp3", duration: null },
    ],
  },
  {
    title: "Healing Love",
    slug: "healing-love",
    description:
      "A devotional album drawing from sacred traditions around the world.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Mother of Compassion (Kwan Zeon Bosal)", order: 1, audioUrl: null, duration: null },
      { title: "Ishe Oluwa", order: 2, audioUrl: null, duration: null },
      { title: "Green Tara", order: 3, audioUrl: null, duration: null },
      { title: "Ruach", order: 4, audioUrl: null, duration: null },
      { title: "Shakti Ye", order: 5, audioUrl: null, duration: null },
      { title: "Fatima's Gift", order: 6, audioUrl: null, duration: null },
      { title: "Healing Love", order: 7, audioUrl: null, duration: null },
      { title: "Ana Elna", order: 8, audioUrl: null, duration: null },
      { title: "White Tara (Russian Tara)", order: 9, audioUrl: null, duration: null },
      { title: "Darood", order: 10, audioUrl: null, duration: null },
      { title: "I Keep My Faith", order: 11, audioUrl: null, duration: null },
      { title: "Medicine Buddha Lotus Crown", order: 12, audioUrl: null, duration: null },
      { title: "Loca (May All Beings Be Well and Happy)", order: 13, audioUrl: null, duration: null },
    ],
  },
  {
    title: "The Bridge",
    slug: "the-bridge",
    description:
      "The Way of the Spiritual Traveller. A musical journey from the mystical traditions of the Middle East. A collaboration of Neil Douglas-Klotz, Abraham and friends. \"Bridge\" follows the way of the traveller through the peaks and valleys of the spiritual path.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [
      { title: "Sample", order: 1, audioUrl: "https://northeastsufis.org/wp-content/uploads/2022/05/Bridge-sample.mp3", duration: null },
    ],
  },
  {
    title: "Saladin: An Epic Poem",
    slug: "saladin-epic-poem",
    description:
      "An epic poem by Murshid Samuel Lewis, read by Wali Ali. 4 CD set. The epic poem Saladin takes the historical moment of the Crusades, and the great example of chivalry in the person of Saladin, as an opportunity to address the resolution of conflicts between Islam, Christianity, and Judaism, and to reveal the mystical depths of Islam.",
    coverUrl: null,
    year: null,
    buyUrl: null,
    published: true,
    tracks: [],
  },
];

// ─── events ──────────────────────────────────────────────────────────────────

const events = [
  {
    title: "Dance Deepening & Leaders Support 2026",
    slug: "dance-deepening-2026",
    description:
      "Transmission & Living Spirit: Towards 7 Generations. With Murshids Halima & Abraham, Malika Salazar + Friends! We attune to the living magnetism that infuses this beautiful practice. Singing and moving together Towards the One, we practice breath, rhythm, sound, listening, and heart awakening. Dancing our prayers, we celebrate the Sacred. All Lovers of the Dance are Welcome. Together we cultivate the ground of our shared future. This is a deepening opportunity for all Dancers and a supportive opportunity for Dance Leaders and Mentors.",
    startDate: new Date("2026-05-29T10:00:00-04:00"),
    endDate: new Date("2026-05-31T14:00:00-04:00"),
    location: "Rural North Central Massachusetts (1.5 hrs NW of Boston)",
    isOnline: false,
    isRetreat: true,
    featured: true,
    published: true,
    registerUrl: null,
    flyerUrl: null,
  },
  {
    title: "Eat, Dance, and Pray Together 2026",
    slug: "eat-dance-pray-2026",
    description:
      "With Abraham & Halima, Malika (Colombia) & Friends. This year's retreat allows us to tune into our natural rhythms and demonstrate Peace and Harmony. Eat, Dance, and Pray together is the actualized vision Sufi Murshid Samuel Lewis held for world peace! We gather to BE present together, to practice simple presence with the Walks and Dances of Universal Peace, Zikr, Meditation, Silence, Listening, Kirtan, and Yoga. We Eat, Dance, and Pray together!",
    startDate: new Date("2026-07-30T10:00:00-04:00"),
    endDate: new Date("2026-08-02T14:00:00-04:00"),
    location: "Rural Massachusetts",
    isOnline: false,
    isRetreat: true,
    featured: true,
    published: true,
    registerUrl: null,
    flyerUrl: null,
  },
];

// ─── run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding content…");

  // Teachers
  for (const t of teachers) {
    await prisma.teacher.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
    process.stdout.write(`  teacher: ${t.name}\n`);
  }

  // Pages
  for (const pg of pages) {
    await prisma.page.upsert({
      where: { slug: pg.slug },
      update: { title: pg.title, content: pg.content },
      create: pg,
    });
    process.stdout.write(`  page: ${pg.slug}\n`);
  }

  // Posts
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, content: post.content, excerpt: post.excerpt, published: post.published, publishedAt: post.publishedAt },
      create: post,
    });
    process.stdout.write(`  post: ${post.slug}\n`);
  }

  // Albums
  for (const album of albums) {
    const { tracks, ...albumData } = album;
    const existing = await prisma.album.findUnique({ where: { slug: album.slug } });
    if (existing) {
      await prisma.track.deleteMany({ where: { albumId: existing.id } });
      await prisma.album.update({
        where: { slug: album.slug },
        data: { ...albumData, tracks: { create: tracks } },
      });
    } else {
      await prisma.album.create({
        data: { ...albumData, tracks: { create: tracks } },
      });
    }
    process.stdout.write(`  album: ${album.slug}\n`);
  }

  // Events
  for (const ev of events) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
    process.stdout.write(`  event: ${ev.slug}\n`);
  }

  console.log("\nContent seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
