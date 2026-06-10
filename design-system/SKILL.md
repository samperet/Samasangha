---
name: northeast-sufis-design
description: Use this skill to generate well-branded interfaces and assets for the Northeast Sufis / SamaSangha (Sufi Ruhaniat lineage), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, you can
copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

## Where things are
- `README.md` — brand context, content voice, visual foundations, iconography. **Read first.**
- `colors_and_type.css` — all design tokens (color, type, spacing, radii, shadows). Import
  this and build only on its CSS variables; never hard-code hex.
- `fonts.md` — the two Google Fonts (Cormorant Garamond display, Mulish body) + substitution note.
- `assets/` — brand emblems (Heart-and-Wings, Dharma tree, calligraphy wings) and warm
  manuscript / community imagery. Place these real PNGs; never redraw the emblems.
- `preview/` — small spec cards for every token and component.
- `ui_kits/website/` — a working clickable recreation of the homepage + SamaSangha library;
  reusable JSX primitives (`Button`, `Badge`, `Divider`, `Section`, cards, header, footer).

## The five things to get right
1. **Gold is the brand's light** — saffron/gold is primary, grounded by lapis, crimson, terracotta.
2. **Warm parchment, never cold grey.** Even shadows are brown-tinted.
3. **Illuminated-manuscript calm:** high-contrast serif display, generous space, gold hairline
   ornament used like punctuation. No tech gradients, no glassmorphism, no emoji.
4. **Voice is an invitational, literate elder:** sentence case, "you/we", sacred terms italic,
   almost no numbers/stats.
5. **The Heart-and-Wings is sacred** — give it room, don't recolor or crop it.
