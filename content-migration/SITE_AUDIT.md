# NortheastSufis.org → SamaSangha Content Migration Audit

Scraped: 2026-05-31 | 64 of 65 pages (1 × 404)
Source: https://northeastsufis.org/
Destination: SamaSangha Next.js app

---

## Navigation Structure (current site)

```
Home
About
  └─ Abraham & Halima
  └─ About (sama-sangha)
  └─ Lineage
       └─ Sufi Lineage (4 figures)
       └─ Ancestors (Frieda, Karmu)
Happenings
  └─ Calendar
Teachings
  └─ Dances of Universal Peace
       └─ Dances in Cambridge
       └─ Articles
       └─ Interviews
       └─ Dances (original-dances)
  └─ Music
       └─ Albums
       └─ Music Videos
Sangha
  └─ Past Events
  └─ Community Photos
Contact
```

---

## Page Inventory & Status

### ✅ RICH CONTENT — Ready to import

| Old URL | Title | Content | New Route |
|---|---|---|---|
| /sama-sangha/ | About SamaSangha | Full "About" text, history since 1972, Abraham & Halima intro | /about/our-story |
| /abraham-halima-sussman/ | Abraham & Halima | Bio of Murshids, teachers, global travel | /about/teachers |
| /hazrat-inayat-khan/ | Hazrat Inayat Khan | Bio + quotes (1882–1927) | /about/lineage |
| /murshid-sam/ | Murshid SAM | Full bio + quotes from diary 1967 | /about/lineage |
| /pir-moineddin-jablonski/ | Pir Moineddin Jablonski | Long detailed bio, organizational history, haiku | /about/lineage |
| /pir-shabda-kahn/ | Pir Shabda Kahn | Long personal bio, musical lineage | /about/lineage |
| /frieda-waterhouse/ | Frida Waterhouse | Autobiography excerpt | /about/lineage (Ancestors) |
| /karmu/ | Karmu | Herbal medicine / spiritual figure | /about/lineage (Ancestors) |
| /dances-of-universal-peace/ | Dances of Universal Peace | Full description, Cambridge schedule, philosophy | /teachings/dances |
| /original-dances/ | Original Dances | 9 dances w/ MP3 URLs by A&H | /teachings/dances/original-dances |
| /articles/ | Articles | Two full articles (Dancing Heart Awake + Be Ye Songs of Glory) | /teachings/dances/articles |
| /dancing-the-heart-awake/ | Dancing the Heart Awake | Full article by Abraham | /teachings/dances/articles |
| /be-ye-songs-of-glory/ | Be Ye Songs of Glory | Full article by Halima | /teachings/dances/articles |
| /dup-leaders-interview/ | Interviews | Interview series on DUP leadership training | /teachings/dances/interviews |
| /tuesday-practice/ | Tuesday Practice | Weekly online Sufi practice, 9AM EST | /teachings/tuesday-practice |
| /dharma-gems/ | Dharma Gems | 6 titled Dharma Gems (video/audio embeds) | /teachings/dharma-gems |
| /talks/ | Talks | Jamiat 2023/2024, 2018, 2012 talks by A&H; MP3 embed | /teachings/talks |
| /albums-2/ | Albums | Master album list page | /teachings/music/albums |
| /in-peace-a-call-to-unity/ | In Peace: A Call to Unity | Full album page + MP3 sample | /teachings/music/albums |
| /voice-of-the-heart-remembering/ | Beginnings (Modern Oratorio) | Full album + 14-track listing | /teachings/music/albums |
| /voice-of-the-heart-remembering-2/ | Voice of the Heart: Remembering | Full album + 12-track listing w/ descriptions | /teachings/music/albums |
| /zikr-of-the-heart/ | Zikr of the Heart | Album w/ 12-track listing + MP3 sample | /teachings/music/albums |
| /almighty-peace/ | Almighty Peace | Album by Maitreya Jon Stevens + MP3 | /teachings/music/albums |
| /waters-of-life/ | Waters of Life | Album + MP3 sample | /teachings/music/albums |
| /healing-love/ | Healing Love | Album + 13-track listing | /teachings/music/albums |
| /albums/ | The Bridge | Album w/ description + MP3 sample | /teachings/music/albums |
| /recordings/ | Saladin (entry) | Saladin epic poem entry | /teachings/music |
| /recordings-2/saladin-… | Saladin full page | Full description of 4-CD set | /teachings/music |
| /music-videos/ | Music Videos | 4 titled videos (Subhanallah, Sama Sangha song, United in Heart retreat, Anna Samia) | /teachings/music/videos |
| /retreats/ | Retreats | Landing page for retreats | /events/retreats |
| /dancedeepening/ | Dance Deepening 2024 | Full retreat info, pricing, location (Memorial Day, N. Central MA) | /events/retreats |
| /turkiyeretreat/ | Türkiye Retreat | Full retreat info, pricing, venue (Şirince, April 11-14) | /events/past |
| /shabda-kahn-retreat/ | Pir Shabda Retreat | 2014 retreat info, "Opening to the Inner Life" | /events/past |
| /ruminight/ | Rumi Night 2017 | Event info + Rumi quotes | /events/past |
| /sesshin/ | Sufi Sesshin | Day-retreat info (Friends Meeting House) | /events/past |
| /jamiat-ahm-2024/ | Jamiat Ahm 2024 | Germany gathering, A&H as guest teachers | /events/past |
| /jamiat-ahm-2023/ | Jamiat Ahm 2023 | Germany gathering, astrological walks focus | /events/past |
| /past-events-2/ | Past Events | India trip/Dalai Lama, EDP 2020/2023/2024, Rumi Night 2022/2023 | /events/past |
| /2023/02/01/god-is-breath-reflection/ | 'God is Breath' Reflection | Full blog post by Dahlia Sura | /teachings/dharma-gems |
| /2023/02/25/toward-the-one-united-with-all/ | 'Toward the One, United With All' | Full blog post by Shakti | /teachings/dharma-gems |
| /2023/04/11/a-divine-inner-flash…/ | A Divine Inner Flash | Blog post by Tarana Wesley + comment | /teachings/dharma-gems |

---

### ⚠️ THIN / STUB PAGES — Mostly visual/embed, need media to be useful

| Old URL | Issue | Action |
|---|---|---|
| /lineage/ | Hub page with links only, no text | Create rich hub with summaries |
| /sufi-lineage/ | Just lists 4 names | Redirect to /about/lineage |
| /ancestors/ | Just lists Frieda + Karmu | Redirect to /about/lineage |
| /teaching/ | Just 4 headings: Dharma Gems, Tuesday, Talks, Deepening | Create rich teaching hub |
| /about/ | Shows blog posts (mis-routed) | Redirect → /about/our-story |
| /albums-2/ | "Click images…" only (images missing) | Replace with proper album list |
| /music-2/ | Just says "Music Videos" | Remove/redirect |
| /recordings-2/ | Empty | Remove |
| /videos/ | Empty | Remove |
| /videos-2/ | Empty | Remove |
| /sacred-nature/ | Empty | Check if album exists, add content |
| /regional/ | Empty | Remove or consolidate |
| /sama/ | Empty (events page) | Consolidate into /events |
| /eat-dance-and-pray/ | Empty | Add EDP content from /past-events-2 |
| /resources/ | Shows "Past Events" (mis-titled) | Fix — use as resources hub |
| /community/ | WordPress forum plugin [wpforo] | Replace with Photos + Resources |
| /events/ | Shows "Community Photos" (mis-routed!) | Fix routing |

---

### 🔒 PASSWORD-PROTECTED — Private content

| Old URL | Title | Notes |
|---|---|---|
| /god-is-breath-2/ | Deepening (Mureeds' Class) | Private, password protected |
| /god-is-breath-2/gib-blog/ | GiB Reflections | Private, password protected |
| /god-is-breath-course-1-lesson-1-videos/ | (not scraped) | Likely also private |
| /god-is-breath-course-1-lesson-2-videos-cloned/ | (not scraped) | Likely also private |

**Recommendation:** Keep the Deepening content password-protected in new site, or use NextAuth role-based access for mureeds.

---

### ❌ 404 / DEAD

| Old URL | Status |
|---|---|
| /eat-dance-pray-united-in-the-heart-retreat-7-31-8-2-2020/ | 404 — content salvaged from /past-events-2/ |

---

## Content Consolidation Map

The current site has **significant URL fragmentation** — many duplicate/orphaned pages for the same content. Here's the clean mapping:

### About Section
```
NEW: /about/our-story
  ← /sama-sangha/ (PRIMARY SOURCE)
  ← /abraham-halima-2/ (older duplicate, same bio)
  ← /about/ (was misrouted to blog)

NEW: /about/teachers
  ← /abraham-halima-sussman/ (PRIMARY)
  ← /abraham-halima-2/ (duplicate)

NEW: /about/lineage  (hub)
  ← /lineage/ (was just a link hub)
  ← /sufi-lineage/ (was just 4 names)

NEW: /about/lineage/hazrat-inayat-khan
  ← /hazrat-inayat-khan/

NEW: /about/lineage/murshid-sam
  ← /murshid-sam/

NEW: /about/lineage/pir-moineddin
  ← /pir-moineddin-jablonski/

NEW: /about/lineage/pir-shabda-kahn
  ← /pir-shabda-kahn/

NEW: /about/lineage/ancestors
  ← /ancestors/
  ← /frieda-waterhouse/
  ← /karmu/
```

### Teachings Section
```
NEW: /teachings  (hub)
  ← /teaching/ (was just 4 headings)

NEW: /teachings/dharma-gems
  ← /dharma-gems/ (6 gems listed)
  ← /2023/02/01/god-is-breath-reflection/ (blog post)
  ← /2023/02/25/toward-the-one-united-with-all/ (blog post)
  ← /2023/04/11/a-divine-inner-flash…/ (blog post)

NEW: /teachings/tuesday-practice
  ← /tuesday-practice/ (good content)

NEW: /teachings/talks
  ← /talks/ (Jamiat 2023/2024, 2012 talks)

NEW: /teachings/deepening  [password-protected]
  ← /god-is-breath-2/
  ← /god-is-breath-2/gib-blog/

NEW: /teachings/dances
  ← /dances-of-universal-peace/ (PRIMARY — rich content)
  ← /sama/ (empty)

NEW: /teachings/dances/cambridge
  ← /dances-of-universal-peace/ (schedule info is here)

NEW: /teachings/dances/original-dances
  ← /original-dances/ (9 dances + MP3 URLs)

NEW: /teachings/dances/articles
  ← /articles/ (two article summaries)
  ← /dancing-the-heart-awake/ (full text)
  ← /be-ye-songs-of-glory/ (full text)

NEW: /teachings/dances/interviews
  ← /dup-leaders-interview/

NEW: /teachings/music  (hub)
  ← /music-2/ (was just "Music Videos")

NEW: /teachings/music/albums
  ← /albums-2/ (hub — was just "click images")
  ← /in-peace-a-call-to-unity/
  ← /voice-of-the-heart-remembering/ (Beginnings/Oratorio)
  ← /voice-of-the-heart-remembering-2/ (Voice of Heart)
  ← /zikr-of-the-heart/
  ← /almighty-peace/
  ← /waters-of-life/
  ← /healing-love/
  ← /albums/ (The Bridge)
  ← /recordings/ (Saladin entry)
  ← /recordings-2/saladin-…/ (Saladin full)

NEW: /teachings/music/videos
  ← /music-videos/ (4 listed videos)
  ← /videos/ (empty)
  ← /videos-2/ (empty)
```

### Events Section
```
NEW: /events/upcoming
  ← /sama/ (empty — was events page)
  ← Calendar plugin data

NEW: /events/retreats
  ← /retreats/ (landing)
  ← /dancedeepening/ (Dance Deepening annual retreat)
  ← /eat-dance-and-pray/ (EDP annual retreat)

NEW: /events/past
  ← /past-events-2/ (PRIMARY — India, EDP 2023/2024, Rumi Nights)
  ← /turkiyeretreat/ (2024 Türkiye retreat)
  ← /shabda-kahn-retreat/ (2014 retreat)
  ← /ruminight/ (2017 Rumi Night)
  ← /sesshin/ (Sufi Sesshin)
  ← /jamiat-ahm-2024/
  ← /jamiat-ahm-2023/
  ← /regional/ (empty)
```

### Community / Sangha Section
```
NEW: /community/photos
  ← /events/ (was mis-mapped to Community Photos — has photo section names:
    Chile retreat, DUP Cambridge, Retreat Royalston, Sufi Sesshin 2021, EDP 2023)

NEW: /community/resources
  ← /resources/ (was mis-titled "Past Events", actually empty)
```

---

## Albums — Complete Database

| Album | Artist/Context | Tracks | MP3 Sample URL | Notes |
|---|---|---|---|---|
| **The Bridge** | Neil Douglas-Klotz, Abraham & friends | Not listed | /wp-content/uploads/2022/05/Bridge-sample.mp3 | "Way of the Spiritual Traveller", CD available |
| **In Peace: A Call to Unity** | SamaSangha | Not listed | /wp-content/uploads/2022/05/sama2-online-audio-converter.com_.mp3 | Devotional chants from DUP |
| **Beginnings: A Modern Oratorio** | Saadi Neil Douglas-Klotz, Abraham | 14 tracks (Genesis/Quran) | /wp-content/uploads/2022/05/Voice-of-the-Heart-Samples.mp3 | Track listing complete |
| **Voice of the Heart: Remembering** | Abraham | 12 tracks | http://northeastsufishop.wordpress.com/files/2009/10/sama3.mp3 | All composed by Abraham; track descriptions |
| **Zikr of the Heart** | Pir Shabda Kahn & Friends | 12 tracks | /wp-content/uploads/2022/09/Zikr-of-the-Heart-1.mp3 | Live Boston, April 2002, 70+ voices |
| **Almighty Peace** | Maitreya Jon Stevens | Not listed | /wp-content/uploads/2022/09/Almighty-Peace.mp3 | Rights held by Maitreya Jon Stevens |
| **Waters of Life** | (not specified) | Not listed | /wp-content/uploads/2022/12/Waters-of-Life-sample.mp3 | |
| **Healing Love** | (not specified) | 13 tracks | None listed | Track listing complete |
| **Sacred Nature** | (not specified) | Unknown | None | Empty page — needs research |
| **Saladin: An Epic Poem** | Murshid Samuel Lewis (read by Wali Ali) | 4 CDs | None | Prophetic poetry, Crusades theme |

---

## Original Dances — Complete List (with MP3 URLs)

All composed by Halima and Abraham.

| Dance | MP3 URL |
|---|---|
| Almighty Peace | /wp-content/uploads/2022/09/Almighty-Peace.mp3 |
| Andalusian Zikr | /wp-content/uploads/2022/09/Andalusian-Zikr.mp3 |
| Ani Mahamin | /wp-content/uploads/2022/09/Ani-Mahamin.mp3 |
| Fatima's Gift | /wp-content/uploads/2022/09/Fatimas-Gift.mp3 |
| Healing Love | /wp-content/uploads/2022/09/Healing-Love.mp3 |
| Lokah Samastah | /wp-content/uploads/2022/09/Lokah-Samastah.mp3 |
| Ruach | /wp-content/uploads/2022/09/Ruach.mp3 |
| Shakti Ye | /wp-content/uploads/2022/09/Shakti-Ye.mp3 |
| Zimbabwe Zikr | /wp-content/uploads/2022/09/Zimbabwe-Zikr.mp3 |

---

## Dharma Gems — Complete List

| Title | Date | Author |
|---|---|---|
| River of Guidance, A Musical Feast 2026 | 2026 | Abraham & Halima + Petaluma Livelli & Khusrau Tom Lena |
| Halima reads from Jack Kornfield poem | Aug 5, 2022 | Halima |
| Solstice Breathing Practice | Dec 21, 2021 | |
| Basira's Dharma Gem: Sama Sangha | Oct 23, 2021 | Basira |
| Dharma Gem – Divine Light | Dec 1, 2021 | |
| Dharma Gem with Abraham | Oct 23, 2021 | Abraham |
| 'God is Breath' Reflection (blog) | Feb 1, 2023 | Dahlia Sura |
| 'Toward the One, United With All' (blog) | Feb 25, 2023 | Shakti |
| A Divine Inner Flash (blog) | Apr 11, 2023 | Tarana Wesley |

---

## Teachers / People — Full Bios Available

| Person | Role | Bio Status | New Route |
|---|---|---|---|
| **Halima** | Murshida, Senior Mentor Teacher | Shared bio with Abraham | /about/teachers |
| **Abraham** | Murshid, Senior Mentor Teacher, original mureed of Murshid Sam | Shared bio with Halima | /about/teachers |
| **Hazrat Inayat Khan** | Founder of Inayati Order (1882–1927) | Short bio + quotes | /about/lineage |
| **Murshid Samuel Lewis** | Founder of Dances, Ruhaniat (d. 1971) | Full bio + diary quotes | /about/lineage |
| **Pir Moineddin Jablonski** | 2nd Pir of Ruhaniat (1971–2000) | Long detailed bio | /about/lineage |
| **Pir Shabda Kahn** | Current Pir of Ruhaniat (2001–) | Long personal/musical bio | /about/lineage |
| **Frida Waterhouse** | Ancestor/elder, amanuensis | Autobiography excerpt | /about/lineage |
| **Karmu** | Ancestor/healer, "Black Christ" | Short bio about herbal medicine | /about/lineage |
| **Malika Salazar** | Colombia, retreat co-teacher | Mentioned, no dedicated page | — |
| **Nur Jahan** | Chile, retreat co-teacher | Mentioned, no dedicated page | — |

---

## Key Recurring Events

| Event | Frequency | Location | Details |
|---|---|---|---|
| **Dances of Universal Peace** | 3rd Saturday of month | Friends Meeting House, 5 Longfellow Park, Cambridge MA | 7:15 doors, 7:30–9:45pm, $10–15 |
| **Tuesday Practice** | Weekly, Tuesdays 9AM EST | Online (Zoom) | Sufi practice & meditation, ~45 min, free/dana |
| **Dance Deepening & Leaders Support** | Annual, Memorial Day weekend | Rural N. Central MA | 3-day retreat, ~$350 |
| **Eat, Dance, and Pray** | Annual, late July | Rural MA | 4-day retreat, Murshid SAM's vision |
| **Sufi Sesshin** | Occasional | Friends Meeting House, Cambridge | Day retreat, $60–100 |
| **Rumi Night** | Occasional | Friends Meeting House, Cambridge | Evening event, $15–20 |

---

## Structural Problems on Current Site

1. **Broken URL routing** — `/events/` shows "Community Photos"; `/about/` shows the blog
2. **Duplicate content** — `/abraham-halima-sussman/` and `/abraham-halima-2/` are the same bio
3. **Empty pages** — `/sama/`, `/eat-dance-and-pray/`, `/regional/`, `/recordings-2/`, `/videos/`, `/videos-2/`, `/sacred-nature/`
4. **Misnamed pages** — `/resources/` is titled "Sangha"; `/events/` is titled "Community Photos"
5. **WordPress plugin artifacts** — `[wpforo]` on community page, contact form shortcodes
6. **URL slugs are confusing** — `/albums-2/`, `/music-2/`, `/recordings-2/`, `/videos-2/` (duplicates with `-2` suffix)
7. **No clear information architecture** — Lineage, Ancestors, Sufi Lineage are 3 separate pages that should be one
8. **Password-protected Deepening content** — needs separate auth strategy in new site

---

## Content Ready to Import into SamaSangha DB

### Pages (via Prisma `Page` model)

| slug | title | source |
|---|---|---|
| our-story | Our Story | /sama-sangha/ |
| lineage | Sufi Lineage | compiled from all lineage pages |
| tuesday-practice | Tuesday Practice | /tuesday-practice/ |
| dances | Dances of Universal Peace | /dances-of-universal-peace/ |
| dances-cambridge | Dances in Cambridge | /dances-of-universal-peace/ (schedule section) |

### Posts (via Prisma `Post` model)

**Category: DHARMA_GEM**
- 'God is Breath' Reflection — Dahlia Sura (Feb 2023)
- 'Toward the One, United With All' — Shakti (Feb 2023)
- A Divine Inner Flash — Tarana Wesley (Apr 2023)
- Dharma Gem: River of Guidance 2026 — Abraham & Halima

**Category: TALK**
- 2024 European Ruhaniat Jamiat Ahm — Abraham & Halima
- 2023 European Ruhaniat Jamiat Ahm — Abraham & Halima
- 2018 Jamiat Khas — Abraham
- 2012 "A Hidden Treasure" (3 parts) — Abraham & Halima
- Nuru Zaleme (Allah Huma Salle) — audio teaching

**Category: DANCE_ARTICLE**
- Dancing the Heart Awake — Abraham (full text available)
- Be Ye Songs of Glory — Halima (full text available)

**Category: DANCE_INTERVIEW**
- Interview with Halima and Noor with Arjun (DUP leadership training series)

**Category: ORIGINAL_DANCE**
- 9 dances (Almighty Peace, Andalusian Zikr, Ani Mahamin, Fatima's Gift, Healing Love, Lokah Samastah, Ruach, Shakti Ye, Zimbabwe Zikr) — all with MP3 URLs

### Teachers (via Prisma `Teacher` model)

| name | order | status |
|---|---|---|
| Halima | 1 | Active teacher (shared with Abraham) |
| Abraham | 2 | Active teacher |
| Hazrat Inayat Khan | 3 | Lineage ancestor |
| Murshid Samuel Lewis | 4 | Lineage ancestor |
| Pir Moineddin Jablonski | 5 | Lineage ancestor |
| Pir Shabda Kahn | 6 | Current Pir |
| Frida Waterhouse | 7 | Ancestor |
| Karmu | 8 | Ancestor |

### Albums (via Prisma `Album` model)

9 albums total — all have sample MP3 URLs and descriptions above.

### Events (import from calendar — live data)

Current 2026 events:
- Dance Deepening & Leaders Support 2026: May 29–31, Rural N. Central MA
- Eat, Dance, and Pray Together 2026: July 30 – Aug 2
- Cambridge DUP: 3rd Saturdays, Friends Meeting House

---

## Assets to Download from Current Site

All hosted at `https://northeastsufis.org/wp-content/uploads/`

### Audio files (MP3)
- /2022/05/Bridge-sample.mp3
- /2022/05/sama2-online-audio-converter.com_.mp3 (In Peace)
- /2022/05/Voice-of-the-Heart-Samples.mp3 (Beginnings)
- /2022/09/Almighty-Peace.mp3
- /2022/09/Andalusian-Zikr.mp3
- /2022/09/Ani-Mahamin.mp3
- /2022/09/Fatimas-Gift.mp3
- /2022/09/Healing-Love.mp3
- /2022/09/Lokah-Samastah.mp3
- /2022/09/Ruach.mp3
- /2022/09/Shakti-Ye.mp3
- /2022/09/Zimbabwe-Zikr.mp3
- /2022/09/Zikr-of-the-Heart-1.mp3
- /2022/10/Nuru-Zaleme.mp3
- /2022/12/Waters-of-Life-sample.mp3
- http://northeastsufishop.wordpress.com/files/2009/10/sama3.mp3 (Voice of Heart — external)

### Images to download
- Banner image: Amina_SAM_640x300.jpeg (already in /Inspiration)
- Logo: cropped-SamaSangha-Flavacon-white-backgraond-1.png (already in /Inspiration)

---

## Recommended Import Order

1. **Teachers** — import 8 teachers first (no dependencies)
2. **Pages** — 5 core pages (our-story, lineage, tuesday-practice, dances, dances-cambridge)
3. **Posts: DANCE_ARTICLE** — 2 articles (full text ready)
4. **Posts: DHARMA_GEM** — 3 blog posts + 4 video gems
5. **Posts: ORIGINAL_DANCE** — 9 dances with MP3s
6. **Posts: TALK** — talks/Jamiat pages
7. **Posts: DANCE_INTERVIEW** — 1 interview
8. **Albums** — 9 albums with track data
9. **Events** — 2026 upcoming events + recurring events

---

*Raw scrape data: `/tmp/northeastsufis_scrape.txt` (116KB, 3464 lines)*
