# Event flyers

Drop flyer PDFs (or images) here and reference them from an event's **Flyer**
field in the admin as `/flyers/<filename>.pdf`.

Files in `public/` are part of the build and served as ordinary static assets,
so this works on Vercel with no object storage, no CORS setup, and no upload
size limit. It's the same approach the Deepening lesson PDFs use
(`/public/assets/deepening/god-is-breath/*.pdf`).

Use this when a flyer is too big for the admin's upload button. Vercel caps a
serverless function's request body at 4.5 MB, so anything larger has to either
go straight to R2 (`STORAGE_PROVIDER=r2`, and the bucket needs a CORS rule
allowing `PUT` from the site's origin) or simply be committed here.

Naming: kebab-case, and include the year so old flyers stay obvious —
e.g. `2026-spring-retreat.pdf`.

Keep an eye on repo size: git stores every version of a binary forever, so
prefer a compressed PDF ("reduce file size" / 150 dpi export) over the raw
print-resolution one.
