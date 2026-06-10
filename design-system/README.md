# Northeast Sufis / SamaSangha — Design System

The official design system for **TheNortheastSufis.org**, the regional home of the
**Sufi Ruhaniat** lineage in the Northeastern United States, and its companion
teachings library, **SamaSangha**.

> **Three words hold the whole system:** *Clarity · Wisdom · Love.*
> Every layout, color, and line of copy should serve at least one of them.

---

## What this is

The **Sufi Ruhaniat** is an inter-spiritual lineage in the line of Hazrat Inayat
Khan and Murshid Samuel L. Lewis ("Sufi Sam"), the tradition that gave rise to the
**Dances of Universal Peace**. It is mystical, devotional, ecumenical — drawing the
gold of Sufism together with the dharma of the Buddha, the heart of the Gospels, and
the song of many traditions. The Northeast Sufis are the regional circle of teachers,
dancers, and seekers who gather under this lineage.

Two surfaces live in this system:

| Surface | What it is | Voice |
| --- | --- | --- |
| **Northeast Sufis** (thenortheastsufis.org) | The public homepage & community site — who we are, gatherings, retreats, Dances of Universal Peace, how to connect with a guide. | Welcoming, grounded, warm. |
| **SamaSangha** | The teachings & content library — talks, practices, readings, recordings. The contemplative reading room of the lineage. | Quiet, reverent, spacious. |

**SamaSangha** = *Sama* (the Sufi practice of sacred listening / spiritual concert)
+ *Sangha* (the Buddhist word for spiritual community). The name itself is the brand
thesis: **listening together, across traditions.**

---

## Sources & provenance

This system was built from a set of brand assets supplied by the community. No
codebase or Figma file was provided — the visual language is reconstructed from these
real artifacts (all copied into `assets/`):

- **`samasangha-winged-heart.png`** — the SamaSangha favicon: the **Heart-and-Wings**,
  the historic emblem of Universal Sufism (winged heart with crescent & star), rendered
  here with rainbow wings.
- **`heart-wing-calligraphy-gold.png`** — gold Arabic calligraphy shaped as wings; a
  delicate header/divider ornament.
- **`dharma-gems-tree.png`** — a gold Bodhi / Dharma tree on a terracotta ground,
  jeweled with tiny winged hearts. The inter-spiritual motif made literal.
- **`illuminated-quran-blue.jpg`** & **`illuminated-quran-rose.png`** — illuminated
  Qur'an manuscript pages; the source of the lapis + gold + crimson palette and the
  ornamental sensibility.
- **`dancing-with-murshid-sam.jpeg`** — a vintage photograph of dancers with a teacher;
  the warm, faded, human, 1970s-counterculture root of the community.

> ⚠️ **If you have the live site, a Figma file, or a CMS export, please re-attach it.**
> This system currently infers structure from brand artifacts, not from production code.

---

## CONTENT FUNDAMENTALS — how we write

The voice is that of a **warm, literate elder** who has read widely and judges no one.
It is devotional without being preachy, poetic without being precious.

**Tone & stance**
- **Invitational, never instructional.** We *welcome*, *offer*, and *invite*; we do not
  *onboard*, *unlock*, or *optimize*. No marketing urgency, no FOMO, no exclamation stacks.
- **"You" and "we", warmly.** Address the reader as *you*; speak of the community as *we*.
  "You are welcome here." "We gather on the first Sunday."
- **Reverent but plain.** Spiritual depth is carried by simple words, not jargon. Prefer
  "stillness" to "mindfulness optimization," "gathering" to "event."
- **Spacious.** Short sentences. Room to breathe. White space is part of the sentence.

**Mechanics**
- **Casing:** Sentence case for headings and buttons ("Find a gathering"). Title Case
  reserved for proper names — *Dances of Universal Peace*, *SamaSangha*, *the Ruhaniat*.
- **Eyebrows / labels:** small uppercase, letterspaced, used sparingly (e.g. `PRACTICE`,
  `FROM THE LIBRARY`).
- **Sacred terms** are honored with care: *Murshid / Murshida* (teacher), *zikr*, *sama*,
  *sangha*, *darshan*. Italicize on first use, then set plain.
- **Numbers & data:** almost never. This is not a metrics brand. No stat-counters, no
  "10,000+ members." If a number appears, it is a date, a time, or a count of seats.
- **Emoji:** none. The Heart-and-Wings is our only "emoji."
- **Quotes** from the lineage's teachers are welcome, attributed simply
  (*— Hazrat Inayat Khan*), set in italic serif.

*Example copy:*
> **Eyebrow:** GATHERINGS
> **Heading:** Come sit in the circle.
> **Body:** Twice a month we gather for zikr, song, and silence. No experience is
> needed — only your presence. Newcomers are always welcome; stay for tea afterward.
> **Button:** See upcoming dates

---

## VISUAL FOUNDATIONS

The whole aesthetic is **"illuminated manuscript meets warm contemplative reading
room."** Gilded, hand-touched, never sterile or techy.

**Color vibe.** Warm and devotional. **Gold/saffron is the primary metal** — it is the
brand's light. It is grounded by **lapis blue** (the night ground of manuscript
illumination), **crimson** (the seal of the heart), and **terracotta** (the warm earth).
Neutrals are **parchment creams** — never cold grey. Everything sits in a warm color
temperature; even shadows are tinted brown, not black.

**Imagery.** Real artifacts, warmly lit: illuminated manuscripts, gilded ornament,
sacred calligraphy, and faded film-grain photographs of gathered people. Photos skew
**warm, slightly desaturated, vintage** — golden-hour, 1970s Kodachrome. Never cold,
clinical, or stock-corporate. When imagery is central, go **full-bleed** with a warm
parchment or ink scrim so type stays legible.

**Type.** A high-contrast literary serif (**Cormorant Garamond**) carries display and
quotes — it has the elegant, slightly calligraphic feel of the manuscript hand. A calm
humanist sans (**Mulish**) carries body and UI for clean readability. Display type runs
**large and airy**; body is generous (17px, 1.6 line-height) with real measure (~68ch).

**Backgrounds.** Mostly flat warm parchment or deep ink. **No purple/blue tech
gradients.** Where richness is wanted, use *subtle* warmth: a faint paper texture, a soft
radial gold glow behind an emblem, or a manuscript image behind a scrim — never a loud
gradient. Section rhythm alternates parchment ↔ a single deep ground (ink or lapis).

**Ornament.** Thin **gold hairline rules**, small centered emblems as section dividers
(the winged heart or calligraphy wings), and the occasional gilded corner flourish.
Ornament is used like punctuation — sparingly, to mark a threshold.

**Spacing & layout.** Generous, unhurried, 8pt rhythm. Centered, symmetrical
compositions are welcome (this is a contemplative brand, not a dense dashboard). Wide
margins. Content max-width ~1180px; prose ~68ch.

**Corner radii.** Soft but restrained — cards ~14px, buttons ~8px or full pill for
gentle CTAs. Nothing sharp-cornered or harshly geometric; nothing bubble-round either.

**Cards.** Cream surface on parchment page, a hairline warm border
(`--surface-border`), soft warm shadow (`--shadow-md`), 14px radius. Often a thin gold
top-rule or a small emblem to mark them. Quiet, like a page in a book.

**Borders & dividers.** 1px warm hairlines (`--surface-border`); gold rules for emphasis.
Decorative dividers are short centered gold lines, sometimes flanking a small glyph.

**Shadows.** Soft, warm-tinted, low. Elevation is gentle — pages, not floating glass.
No hard drop shadows, no neumorphism.

**Transparency & blur.** Used lightly: a parchment or ink scrim (75–90% opacity) over
full-bleed imagery to protect text; occasional soft backdrop. Not a glassmorphism brand.

**Animation.** Calm and slow. Gentle fades and soft rises (`ease`, 300–600ms). Things
**breathe** in, they do not bounce, snap, or whoosh. Hover is a quiet shift, never a
jolt. Respect `prefers-reduced-motion`.

**Hover states.** Links → deepen toward crimson. Buttons → slightly darker/richer fill
or a soft gold glow ring. Cards → a touch more shadow and a 1–2px rise. Subtle opacity
shifts (0.85) for ornament.

**Press states.** A small settle: translateY(1px) and a slightly deeper fill. No
aggressive scale-down.

---

## ICONOGRAPHY

The brand's "iconography" is **emblematic, not utilitarian.** Its true icon is the
**Heart-and-Wings** — used as logo, favicon, divider, and bullet. Treat it as sacred:
give it room, don't recolor it arbitrarily, don't crop the wings.

- **Brand emblems** (in `assets/`): the rainbow winged heart, the gold calligraphy
  wings, the Dharma tree. Use these as ornaments and section markers — never redraw them.
- **Functional UI icons:** for utility needs (menu, search, arrows, play, calendar) the
  system uses **[Lucide](https://lucide.dev)** via CDN — a thin, humane, round-cap line
  set that sits quietly beside the serif type. Stroke ~1.75px, currentColor, sized 18–24px.
  > ⚠️ **Substitution flag:** Lucide is a chosen match, not an extracted brand set — the
  > source artifacts contained no UI-icon library. Swap if the community has a preferred set.
- **Emoji:** not used.
- **Unicode glyphs:** a few are welcome as quiet ornament — `✦` `✶` `❧` `·` — for
  dividers and bullets, in gold.
- **Never** hand-draw new emblems in SVG to imitate the brand marks; always place the
  real PNG assets.

---

## Index — what's in this system

**Foundations**
- `colors_and_type.css` — all color tokens (brand + semantic), type families & scale,
  spacing, radii, shadows. Import this first.
- `assets/` — brand emblems, manuscript imagery, the community photograph.
- `fonts.md` — note on the Google Fonts used and how to self-host.

**Design System tab (`preview/`)** — small spec cards: color palettes, type specimens,
spacing, radii, shadows, buttons, cards, form fields, badges, the emblem set.

**UI Kit**
- `ui_kits/website/` — high-fidelity recreation of the Northeast Sufis homepage and the
  SamaSangha library, as a clickable prototype. See its own `README.md`.

**For agents**
- `SKILL.md` — how to use this system to generate on-brand artifacts.

---

*Built with care, in the spirit of clarity, wisdom, and love.*
