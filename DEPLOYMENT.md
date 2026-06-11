# Deploying SamaSangha to Production

Stack: **Vercel** (hosting) + **Cloudflare R2** (file/media storage) + a managed
**PostgreSQL** database + **GitHub** (source, already pushed to
`github.com/samperet/Samasangha`).

The code is production-ready: `next build` is green, `prisma generate` runs in the
build, the admin auth uses signed cookies (secure in production), and `next/image`
auto-allowlists the R2 host from `R2_PUBLIC_URL`. What remains is account/dashboard
setup — the steps below. Anything that involves pasting a secret or granting an
OAuth permission must be done by you.

---

## 1. Provision a production PostgreSQL database

Vercel's filesystem is ephemeral, and the local Postgres won't be reachable, so you
need a hosted DB. Easiest options:

- **Neon** (recommended, generous free tier) — neon.tech → create project → copy the
  pooled connection string.
- **Supabase** or **Vercel Postgres** also work.

Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`).
You'll paste it as `DATABASE_URL` in step 4.

## 2. Create the Cloudflare R2 bucket

In the Cloudflare dashboard → **R2**:

1. **Create bucket** — e.g. `samasangha-media`.
2. **Settings → Public access** — enable a public URL (either the `r2.dev` dev URL or a
   custom domain like `media.samasangha.org`). This is your `R2_PUBLIC_URL`.
3. **Manage R2 API Tokens → Create API token** — Object Read & Write, scoped to this
   bucket. Save the **Access Key ID** and **Secret Access Key** (shown once).
4. Note your **Account ID** (R2 overview page).

Values you now have: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

## 3. Import the repo into Vercel

Vercel → **Add New → Project** → import `samperet/Samasangha` (authorize GitHub if
prompted — this is the one OAuth grant you do yourself). Framework auto-detects as
**Next.js**. Leave build/output settings at defaults (the `build` script already runs
`prisma generate && next build`). **Don't deploy yet** — add env vars first (step 4).

## 4. Set environment variables in Vercel

Project → **Settings → Environment Variables** → add each of these (Production, and
Preview if you want preview deploys to work):

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Postgres string from step 1 |
| `ADMIN_PASSWORD` | a strong password (this is the admin login) |
| `ADMIN_SESSION_SECRET` | run `openssl rand -base64 32` and paste the output |
| `DEEPENING_PASSWORD` | `AHHA` (the Mureeds' Deepening page password) |
| `STORAGE_PROVIDER` | `r2` |
| `R2_ACCOUNT_ID` | from step 2 |
| `R2_ACCESS_KEY_ID` | from step 2 |
| `R2_SECRET_ACCESS_KEY` | from step 2 |
| `R2_BUCKET_NAME` | from step 2 |
| `R2_PUBLIC_URL` | from step 2 (no trailing slash) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | mail provider creds (for the contact form) |
| `EMAIL_FROM` / `EMAIL_TO` | sender + inbox for contact-form mail |

Then **Deploy**.

## 5. Initialize the production database (one time)

The build doesn't create tables. With the production `DATABASE_URL` in your **local**
`.env` (or exported in the shell), run from your machine:

```bash
npx prisma db push        # create the schema in prod
npm run seed              # seed starter retreat rooms (admin login uses ADMIN_PASSWORD)
```

Optionally `npm run seed:content` / `npm run seed:videos` if you want the starter
content, then re-add your real content through the admin (triple-click the navbar heart
→ `/admin`, or go straight to `/admin/login`).

## 6. Media & audio (important)

- **New uploads** (admin media library, images) → go to R2 automatically once
  `STORAGE_PROVIDER=r2`. ✅
- **Existing album audio** lives at `/public/music/*` which is **gitignored**, so it is
  NOT in the repo and won't exist on Vercel — those albums won't play in production
  until the audio is hosted. Fix: upload the m4a/mp3 files to R2 and update each
  track's `audioUrl`, or commit them. (The **Original Dances** album already uses
  external URLs, so it works as-is.) Tell me if you want me to script the R2 upload +
  track-URL migration.

## 7. Custom domain (optional)

Vercel → Settings → **Domains** → add `samasangha.org` (or chosen domain) and follow the
DNS instructions. Vercel issues the TLS cert automatically.

## Post-deploy checklist

- [ ] Home, Teachings, Music, Dances pages load
- [ ] `/admin/login` accepts `ADMIN_PASSWORD`; dashboard loads
- [ ] Upload an image in the admin media library → confirm it serves from the R2 URL
- [ ] Contact form sends mail
- [ ] Album audio plays (after step 6)
