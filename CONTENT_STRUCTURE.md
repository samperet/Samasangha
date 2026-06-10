# SamaSangha — Content Structure Guide

> **Three words hold everything:** *Clarity · Wisdom · Love.*  
> Every page, post, and event should serve at least one of them.

---

## Principles

**Write for a warm, literate elder** — invitational, never instructional. We *welcome*, *offer*, and *invite*; we do not *onboard*, *unlock*, or *optimize*.

**Sentence case everywhere.** Headings, buttons, labels. Title Case only for proper names: *Dances of Universal Peace*, *SamaSangha*, *the Ruhaniat*, *Hazrat Inayat Khan*.

**Spacious, not dense.** Short sentences. Room to breathe. A question posed is better than a paragraph answered.

**Sacred terms deserve care.** Italicize on first use: *zikr*, *sama*, *sangha*, *murshid/murshida*, *darshan*, *fana*. Then set plain.

**No numbers as proof.** This is not a metrics brand. If a number appears, it is a date, a time, or a seat count.

---

## Site Map

```
/                          Homepage — prayer, Discover/Deepen, upcoming retreats
│
├── /about
│   ├── /about/our-story          Who we are and how we gathered
│   ├── /about/teachers           Active teachers + lineage figures
│   └── /about/lineage            The chain of transmission (Inayati/Ruhaniat)
│       └── /about/teachers/[slug]  Individual teacher bio
│
├── /teachings
│   ├── /teachings/dharma-gems              Short reflections from the sangha
│   │   └── /teachings/dharma-gems/[slug]   Individual gem
│   ├── /teachings/tuesday-practice         Weekly online practice info
│   ├── /teachings/talks                    Recorded talks and teachings
│   │   └── /teachings/talks/[slug]         Individual talk
│   ├── /teachings/deepening                Mureeds' class (password-protected content)
│   ├── /teachings/dances                   Dances of Universal Peace overview
│   │   ├── /teachings/dances/cambridge         Local monthly gathering
│   │   ├── /teachings/dances/original-dances   Dances by Halima & Abraham (with audio)
│   │   ├── /teachings/dances/articles          Long-form articles on dance leading
│   │   │   └── /teachings/dances/articles/[slug]
│   │   └── /teachings/dances/interviews        Video interviews with senior mentors
│   └── /teachings/music
│       ├── /teachings/music/albums         Album library with track listings
│       │   └── /teachings/music/albums/[slug]  Individual album + audio player
│       └── /teachings/music/videos         Music videos (YouTube embeds)
│
├── /events
│   ├── /events/upcoming           All upcoming published events
│   ├── /events/retreats           Upcoming retreats specifically
│   ├── /events/past               Archive of past events
│   ├── /events/[slug]             Individual event detail page
│   └── /events/[slug]/register    Registration form (when registration is enabled)
│
├── /community
│   ├── /community/photos          Photo gallery (unattached Media records)
│   └── /community/resources       Resource posts (RESOURCE category)
│
└── /contact                       Contact form + mailing list signup
```

---

## Database Models — What Goes Where

### `Post` model — Categories

| Category | Admin path | Public path | Use for |
|---|---|---|---|
| `DHARMA_GEM` | Admin → Posts | /teachings/dharma-gems | Short reflections, practice notes, community writings |
| `TALK` | Admin → Posts | /teachings/talks | Recorded talks, Jamiat Ahm recordings, audio teachings |
| `DANCE_ARTICLE` | Admin → Posts | /teachings/dances/articles | Long-form articles on dance leading, Elements of Mastery |
| `DANCE_INTERVIEW` | Admin → Posts | /teachings/dances/interviews | Video interviews with dance mentors and leaders |
| `ORIGINAL_DANCE` | Admin → Posts | /teachings/dances/original-dances | Individual original dances with downloadable audio |
| `RESOURCE` | Admin → Posts | /community/resources | Recommended books, practice guides, external links |

### `Page` model — Static content blocks

Used for pages whose content changes rarely. Edit in Admin → (direct DB or future page editor).

| Slug | Used on | Content |
|---|---|---|
| `our-story` | /about/our-story | Community history and mission |
| `lineage` | /about/lineage | Intro text for the lineage page |
| `tuesday-practice` | /teachings/tuesday-practice | Schedule, Zoom info, dana instructions |
| `dances` | /teachings/dances | DUP overview and Cambridge schedule |
| `dances-cambridge` | /teachings/dances/cambridge | Cambridge-specific schedule and location |
| `deepening` | /teachings/deepening | Description of the Mureeds' class |

### `Teacher` model — Bios and lineage figures

Order field controls display sequence. Convention:

| Order | Who |
|---|---|
| 1–2 | Active teachers (Halima, Abraham) |
| 3–6 | Ruhaniat lineage (Hazrat Inayat Khan → Pir Shabda) |
| 7+ | Ancestors and elders (Frida, Karmu, etc.) |

### `Event` model — Gatherings

| Field | Guidance |
|---|---|
| `published` | Set to true only when the event is ready for public view |
| `featured` | Shows on the homepage (limit to 2–3 at most) |
| `isRetreat` | Shows in /events/retreats; also used for homepage "Upcoming retreats" section |
| `registrationEnabled` | Enables the built-in registration form at /events/[slug]/register |
| `registrationDeadline` | Registration closes automatically; leave blank to keep open |
| `capacity` | When set, full events auto-waitlist new registrations |
| `priceMin / priceMax` | Shown as "$X–$Y sliding scale" on the registration page; leave blank for free |

### `Album` model

- Each `Track` has an optional `audioUrl` — link directly to the hosted MP3 (currently on northeastsufis.org; migrate to R2 for production)
- Set `published: false` for albums still being set up

---

## Writing Guide by Content Type

### Dharma Gems

**Length:** 150–600 words.  
**Voice:** First person is fine — these are personal reflections.  
**Structure:** No formal structure required. A single image, practice note, or moment of clarity. End where the breath ends.  
**Excerpt:** One sentence that names the quality or question at the heart of the piece.

*Example eyebrow:* `DHARMA GEM`  
*Example title:* `The spiral that opens`  
*Example body opening:* `It's more of an unfurling than an unfolding, the Soul.`

---

### Talks

**Length:** As long as the recording.  
**Structure:** Date, context (event name/year), embed or audio link, brief description of what is covered.  
**Excerpt:** One sentence naming the theme and the speaker.

---

### Articles (Dance)

**Length:** 600–2000 words.  
**Structure:** Lead with a concrete moment or encounter. Move to principle. Close with invitation.  
**No bullet lists** — the prose should flow like a teaching.  
**Attributed simply:** *— Murshid Abraham* or *— Murshida Halima*

---

### Events

**Title:** Plain and specific. `Dance Deepening & Leaders Support 2026` not `Summer Retreat!`  
**Description:** 2–4 paragraphs. Who leads, what will be practiced, who is welcome. Pricing and logistics in the last paragraph.  
**Location:** Full address for in-person events. "Online — details sent upon registration" for Zoom events.

---

### Teacher bios

**Length:** 100–400 words.  
**Voice:** Third person.  
**Lineage figures:** Include dates (birth–death or appointment year). One or two signature quotes in blockquote.  
**Active teachers:** Emphasize transmission lineage, practice style, and what participants can expect from working with them.

---

## Content Checklist Before Publishing

**Every post:**
- [ ] Title is in sentence case
- [ ] Excerpt is filled in (shown in listing pages and search previews)
- [ ] `published` is checked
- [ ] `publishedAt` date is set correctly

**Every event:**
- [ ] Start and end date are correct (double-check timezone)
- [ ] Location is filled in, or `isOnline` is checked
- [ ] `published` is checked
- [ ] If using built-in registration: `registrationEnabled` is on, capacity is set if applicable

**Every album:**
- [ ] Track order is correct (1, 2, 3…)
- [ ] At least one track has an `audioUrl` for the sample player on the list page
- [ ] `published` is checked

**Every teacher bio:**
- [ ] `order` field is set correctly
- [ ] Bio is in HTML (use the rich text editor)
- [ ] `published` is checked

---

## URL Conventions

- All slugs are lowercase kebab-case, auto-generated from titles
- Never use `-2`, `-3` suffixes (the old WordPress site had many; consolidate them here)
- Event slugs include the year: `dance-deepening-2026`, `eat-dance-pray-2026`
- Post slugs are descriptive: `dancing-the-heart-awake`, not `post-123`
- Teacher slugs match their name: `halima-sussman`, `pir-shabda-kahn`

---

## Media Conventions

**Images:**  
- Upload via Admin → Media Library  
- Use `.jpg` for photographs, `.png` for logos and emblems  
- Reference by URL in event `flyerUrl`, teacher `photoUrl`, album `coverUrl`

**Audio:**  
- Currently hosted on northeastsufis.org/wp-content/uploads/  
- For production: run `bash content-migration/download-assets.sh` then switch to R2  
- Set `STORAGE_PROVIDER=r2` in `.env` and fill in R2 credentials

**Brand assets** (do not modify or re-export):  
- `/public/assets/samasangha-winged-heart.png` — favicon and nav logo  
- `/public/assets/heart-wing-calligraphy-gold.png` — footer divider ornament  
- `/public/assets/dharma-gems-tree.png` — homepage closing section  
- `/public/assets/winged-heart-emblem.png` — alternate emblem  

---

## Ongoing Maintenance

| Cadence | Task |
|---|---|
| After each gathering | Add a Dharma Gem or talk recording |
| When a new retreat is confirmed | Create event, enable registration, set capacity |
| Seasonally | Archive past events (they appear automatically in /events/past) |
| When a new album is ready | Create Album + Tracks; upload audio to R2 |
| Annually | Review and update teacher bios; verify all audio URLs are live |
