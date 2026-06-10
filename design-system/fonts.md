# Fonts

This system uses two Google Fonts, loaded via CDN in `colors_and_type.css`:

- **Cormorant Garamond** — display serif (headings, quotes, the literary/calligraphic
  voice of illuminated manuscripts). Weights 400–700, plus italics.
- **Mulish** — humanist sans (body copy, UI, labels). Weights 300–700.

> ⚠️ **Substitution note:** No brand font files were supplied. These two are chosen
> matches for the lineage's elegant-yet-calm character, loaded from Google Fonts. If the
> community has licensed brand fonts, drop the `.woff2`/`.ttf` files in this `fonts/`
> folder, add `@font-face` rules, and remove the Google import at the top of
> `colors_and_type.css`.

To self-host, download from:
- https://fonts.google.com/specimen/Cormorant+Garamond
- https://fonts.google.com/specimen/Mulish
