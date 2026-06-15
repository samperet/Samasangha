# Production Deployment — Vercel + Cloudflare R2

A complete, codebase-specific runbook for taking SamaSangha live on Vercel with
Cloudflare R2 storage. Work top to bottom; each section's outputs feed the next.

> **Architecture in one breath:** Next.js 16 (App Router) on Vercel · PostgreSQL via
> Prisma v7 with the `@prisma/adapter-pg` driver adapter · file/media/audio storage on
> Cloudflare R2 · transactional email via SMTP (nodemailer) · password-based admin auth
> (no user accounts), signed with an HMAC cookie. Vercel's runtime filesystem is
> **read-only**, so anything user-uploaded or downloaded MUST live on R2, not `/public`.

---

## 0. Pre-flight: three code issues to fix BEFORE first deploy

These are real and will break in production if shipped as-is.

### 0.1 — Stale auth/middleware redirect (will 404 the Deepening gate)
`proxy.ts` (this Next version's middleware) still redirects locked mureed PDFs to the
old `/teachings/deepening` path. The teachings tree was renamed to `/deepen`, so this
now points at a 404.

```diff
# proxy.ts, line ~19
-      return NextResponse.redirect(new URL("/teachings/deepening", request.url));
+      return NextResponse.redirect(new URL("/deepen/deepening", request.url));
```

### 0.2 — `vercel.json` uses deprecated secret syntax + dead env vars
The committed `vercel.json` references `@database-url`-style **Secrets** (a removed Vercel
feature that fails the build) and `NEXTAUTH_SECRET` / `NEXTAUTH_URL`, which this app no
longer uses for auth (auth is HMAC-based on `ADMIN_SESSION_SECRET`). Replace the whole
file with just the build command, and set env vars in the Vercel dashboard instead:

```json
{
  "buildCommand": "npx prisma generate && next build"
}
```
(Or delete `vercel.json` entirely — `package.json`'s `build` script already runs
`prisma generate && next build`, and Vercel auto-detects Next.js.)

### 0.3 — `.env.example` secret-name drift
The auth secret is read as `ADMIN_SESSION_SECRET ?? NEXTAUTH_SECRET ?? "samasangha-dev-secret"`
(see `lib/admin-token.ts`). `.env.example` documents `ADMIN_SESSION_SECRET`; your local
`.env` happens to use `NEXTAUTH_SECRET`. **Both work**, but standardize on
`ADMIN_SESSION_SECRET` for production so the fallback dev secret is never reachable. If
neither var is set in prod, the app signs sessions with a public hardcoded string —
anyone could forge an admin cookie. **Setting this in prod is mandatory.**

---

## 1. Provision external services

You need four things before touching Vercel:

| Service | Purpose | Recommended |
|---|---|---|
| **PostgreSQL** | App database | Neon, Supabase, or Vercel Postgres (all serverless-friendly) |
| **Cloudflare R2** | Media, uploads, audio | Cloudflare account (free tier covers this site) |
| **SMTP** | Contact form + retreat registration emails | Gmail App Password, or a transactional provider (Resend/SES/Postmark via SMTP) |
| **Domain** | Public site + R2 media subdomain | Your registrar; DNS ideally on Cloudflare |

### 1.1 PostgreSQL — serverless pooling matters
This app uses `@prisma/adapter-pg` (a real TCP Postgres connection, **not** Prisma
Accelerate). On Vercel's serverless functions, each invocation can open a connection, so
you must use a **pooled** connection string to avoid exhausting the database:

- **Neon:** use the *pooled* connection string (host contains `-pooler`).
- **Supabase:** use the **Transaction pooler** URL (port `6543`), not the direct `5432`.
- **Vercel Postgres:** use the `POSTGRES_PRISMA_URL` (pooled) it generates.

Keep the URL handy for `DATABASE_URL`. Append `?sslmode=require` if the provider needs it.

---

## 2. Cloudflare R2 setup

### 2.1 Create the bucket
1. Cloudflare dashboard → **R2** → **Create bucket** (e.g. `samasangha-media`).
2. Note the bucket name → this is `R2_BUCKET_NAME`.

### 2.2 Find your Account ID
R2 overview page → copy **Account ID** → this is `R2_ACCOUNT_ID`. (It forms the S3
endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` used in `lib/storage.ts`.)

### 2.3 Create an API token (S3 credentials)
R2 → **Manage R2 API Tokens** → **Create API token**:
- Permission: **Object Read & Write**.
- Scope: the single bucket above (least privilege).
- Save the **Access Key ID** → `R2_ACCESS_KEY_ID`
- Save the **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (shown once)

### 2.4 Make the bucket publicly readable
Media (images, audio, album art) is served directly to browsers, so the bucket needs a
public base URL. Two options:

- **Custom domain (recommended):** Bucket → **Settings** → **Public access** → **Connect
  domain** → e.g. `media.samasangha.org`. Cloudflare adds the DNS record automatically if
  the domain is on Cloudflare. Public URL becomes `https://media.samasangha.org`.
- **r2.dev dev URL (quick start):** enable **Allow Access** under the r2.dev subdomain.
  Public URL looks like `https://pub-xxxxxxxx.r2.dev`. Fine for launch; rate-limited and
  not meant for high traffic — migrate to a custom domain later.

Set the chosen base URL (no trailing slash) as `R2_PUBLIC_URL`. The hostname is
**auto-allowlisted for `next/image`** by `next.config.ts` (it parses `R2_PUBLIC_URL`), so
there's nothing to hardcode there.

### 2.5 CORS (only needed for the album ZIP download)
The `/api/music/[slug]/download` route runs server-side `fetch()` against R2 to build
ZIPs, which is server-to-server and **not** subject to browser CORS. Direct `<img>`/
`<audio>` loads from the public bucket are also fine without CORS. So CORS config is
**not required** for current features. (Only add an R2 CORS rule if you later fetch R2
objects from client-side JavaScript.)

---

## 3. Environment variables — the complete set

Every variable the code reads (`grep process.env`), what it's for, and the production
value. Set all of these in **Vercel → Project → Settings → Environment Variables**
(Production, and Preview if you want preview deploys to work).

| Variable | Required | Used by | Production value |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `prisma.config.ts`, `lib/prisma.ts`, scripts | Pooled Postgres URL from §1.1 |
| `ADMIN_PASSWORD` | ✅ | `lib/admin-token.ts` | The single admin sign-in password (strong) |
| `ADMIN_SESSION_SECRET` | ✅ | `lib/admin-token.ts` (cookie HMAC) | `openssl rand -base64 32` |
| `DEEPENING_PASSWORD` | ✅ | `lib/admin-token.ts` | Mureeds' class/Deepening + Directory password |
| `STORAGE_PROVIDER` | ✅ | `lib/storage.ts` | **`r2`** (anything else writes to read-only `/public` → fails) |
| `R2_ACCOUNT_ID` | ✅ | `lib/storage.ts`, upload script | From §2.2 |
| `R2_ACCESS_KEY_ID` | ✅ | `lib/storage.ts`, upload script | From §2.3 |
| `R2_SECRET_ACCESS_KEY` | ✅ | `lib/storage.ts`, upload script | From §2.3 |
| `R2_BUCKET_NAME` | ✅ | `lib/storage.ts`, upload script | From §2.1 |
| `R2_PUBLIC_URL` | ✅ | `lib/storage.ts`, `next.config.ts`, upload script | Public base URL from §2.4, **no trailing slash** |
| `SMTP_HOST` | ✅* | `lib/mail.ts` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | ✅* | `lib/mail.ts` | `587` |
| `SMTP_USER` | ✅* | `lib/mail.ts` | SMTP username / Gmail address |
| `SMTP_PASS` | ✅* | `lib/mail.ts` | SMTP password / **Gmail App Password** (not the account password) |
| `EMAIL_FROM` | ✅* | `lib/mail.ts` | From address, e.g. `noreply@samasangha.org` |
| `EMAIL_TO` | ✅* | `lib/mail.ts` | Inbox for contact + registration notifications |
| `PAYPAL_CLIENT_ID` | ⬜ | `lib/paypal.ts` | REST app client id (see §3.1) — enables card/PayPal checkout |
| `PAYPAL_SECRET` | ⬜ | `lib/paypal.ts` | REST app secret (see §3.1) |
| `PAYPAL_ENV` | ⬜ | `lib/paypal.ts` | `live` in production, `sandbox` for testing |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ⬜ | checkout page | **Same value** as `PAYPAL_CLIENT_ID` (the browser SDK needs it) |
| `CHECK_PAYABLE_TO` | ⬜ | `lib/mail.ts` | Payee name shown in check instructions (default `SamaSangha`) |
| `CHECK_MAILING_ADDRESS` | ⬜ | `lib/mail.ts` | Address checks are mailed to; blank = "reply for the address" |

\* Email vars are required for the contact form and retreat-registration emails to work.
If you launch before email is ready, those POSTs will throw when sending — wire SMTP
before announcing registration.

### 3.1 PayPal — accepting credit cards & PayPal in event checkout

The built-in event checkout can take payment online (credit/debit card **or** a
PayPal account) via PayPal's Smart Buttons + Orders v2 API. If these vars are left
blank, the online option is hidden and registrants can still **pay by check**.

To get the credentials:
1. Sign in at **https://developer.paypal.com/dashboard/** with the SamaSangha
   PayPal **Business** account (card payments require a Business account; upgrade
   under paypal.com → Settings if it's currently Personal).
2. Go to **Apps & Credentials**. Toggle **Live** (top right) for production
   credentials, or **Sandbox** for testing.
3. Click **Create App**, name it e.g. `SamaSangha Website`, type **Merchant**.
4. Copy the **Client ID** and **Secret** from the app page. Set:
   - `PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID` → the Client ID (same value)
   - `PAYPAL_SECRET` → the Secret
   - `PAYPAL_ENV` → `live` (or `sandbox` while testing)
5. In the app's settings, ensure **Accept payments** is enabled. To show the card
   fields to buyers without a PayPal account, enable **Advanced (or standard) Credit
   and Debit Card Payments** for the account (PayPal → Account Settings → Website
   payments / Pay with card). PayPal reviews this for live accounts; until approved,
   buyers can still pay with a PayPal balance/login.
6. Redeploy. Test one real low-value registration in `live` to confirm funds land.

That is everything the site needs from PayPal: a Business account, and one REST
app's **Client ID + Secret** (per environment).

**Notes**
- `NODE_ENV` is set by Vercel automatically — don't add it.
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` from the old `.env` are **legacy**. `NEXTAUTH_SECRET`
  still works as a fallback for the cookie secret, but prefer `ADMIN_SESSION_SECRET`.
  `NEXTAUTH_URL` is unused by the code — drop it.
- Generate the session secret: `openssl rand -base64 32`.
- After changing env vars in Vercel, **redeploy** — they're injected at build/runtime, not
  hot-reloaded.

### Local `.env` cleanup (optional but recommended)
Align your local `.env` with what prod expects so the two don't drift:
- Rename `NEXTAUTH_SECRET` → `ADMIN_SESSION_SECRET` (or add the latter).
- Delete `NEXTAUTH_URL`.
- `.env` is gitignored (`.gitignore` line 34) — never commit real secrets.

---

## 4. Database: push schema + seed

The repo has **no `prisma/migrations/`** — it uses `db push` (schema-sync, no migration
history). Against the **production** database, run from your machine with the prod
`DATABASE_URL` exported (or in a temporary `.env.production`):

```bash
# 1. Sync the schema (creates all tables: Post, Event, Album, Track, Teacher,
#    MureedProfile, etc.)
DATABASE_URL="<prod-pooled-url>" npx prisma db push

# 2. Seed starter retreat rooms (needed for registration room assignment)
DATABASE_URL="<prod-pooled-url>" npm run seed

# 3. (If starting empty) seed content — posts/teachers/etc.
DATABASE_URL="<prod-pooled-url>" npm run seed:content
DATABASE_URL="<prod-pooled-url>" npm run seed:videos
```

**Migrating your existing local data instead of seeding:** if production should mirror the
content you've built locally (the lineage bios, the Deepen additions, the Mureed
Directory schema, etc.), dump and restore rather than re-seed:

```bash
pg_dump "<local-url>" --no-owner --no-acl > samasangha.sql
psql "<prod-direct-url>" < samasangha.sql      # use the DIRECT (non-pooled) URL for restore
```
Then still run §5 so audio/media URLs resolve on R2.

> Tip: consider initializing real migrations before launch
> (`prisma migrate dev --name init`) so future schema changes are versioned and
> reviewable. Not required, but healthier than `db push` against production long-term.

---

## 5. Media & audio migration to R2 (critical)

**Why this is mandatory:** the album audio under `public/music/**` is **gitignored** — it
is *not* in the repo and will *not* exist on Vercel. Right now **88 `Track.audioUrl`
values point at local `/music/...` paths** that 404 in production. The site also serves
admin-uploaded images and album art that must live on R2.

### 5.1 Upload audio and repoint the database
The repo ships a purpose-built script, `scripts/upload-music-r2.ts`. It walks
`public/music/**`, uploads each audio file to R2 preserving the path
(`music/<album>/<file>`), skips files already present (idempotent), then rewrites every
`Track.audioUrl` from `/music/...` to the absolute R2 URL.

```bash
# Dry run first — lists what it would upload/update, changes nothing
npx tsx scripts/upload-music-r2.ts --dry-run

# Real run — needs all R2_* vars + DATABASE_URL pointing at PROD.
# Easiest: put prod values in .env (the script imports dotenv/config) then:
npx tsx scripts/upload-music-r2.ts
```
Run it **after** §4 (the DB must have the Track rows to repoint). The audio lives only on
your local machine (~929 MB, gitignored), so this upload must be run from there.

### 5.2 Album cover art
Covers live in `public/music/covers/` and **are** committed to git, so they deploy with
the app and load fine from `/music/covers/...`. No action needed unless you'd rather serve
them from R2 too.

### 5.3 Existing admin-uploaded images
Any image previously uploaded in local dev sits in `public/uploads/` (gitignored) with a
`/uploads/...` URL in the DB. Those won't exist on Vercel. If you have important ones,
re-upload them through the admin UI once deployed (with `STORAGE_PROVIDER=r2`, new uploads
go straight to R2). Otherwise they'll show broken — audit `Media` and any
`featuredImageUrl`/`coverUrl`/`photoUrl` starting with `/uploads/`.

> The lineage portraits added recently live under `public/assets/lineage/` and **are**
> committed — they deploy normally, no R2 needed. Same for `/assets/...` decorative art.

---

## 6. Vercel project setup & deploy

1. **Push to GitHub** (ensure §0 fixes are committed). Repo is already at
   `github.com/samperet/Samasangha`.
2. Vercel → **Add New → Project** → import the repo (authorize GitHub if prompted).
3. **Framework Preset:** Next.js (auto-detected).
4. **Build command:** leave default — `package.json` runs `prisma generate && next build`.
   (If you kept a `vercel.json`, make sure it only sets `buildCommand` per §0.2.)
5. **Node.js version:** set to **20.x** (Next 16 / React 19 require Node ≥ 20). Project
   Settings → General → Node.js Version.
6. **Environment Variables:** add every row from §3 (Production scope; add Preview too if
   you use preview deployments — they need their own DB or they'll mutate prod).
7. **Deploy.** The first build runs `prisma generate` (driver-adapter client, no native
   engine binary needed) then `next build`.

---

## 7. Domain & DNS

1. Vercel → Project → **Domains** → add `samasangha.org` (and `www`).
2. Point DNS at Vercel (CNAME/A per Vercel's instructions). If DNS is on Cloudflare, set
   those records to **DNS only (grey cloud)** for the apex/app to avoid proxy conflicts
   with Vercel's edge — or follow Vercel's Cloudflare guidance. TLS cert is automatic.
3. Keep the R2 media subdomain (`media.samasangha.org`, §2.4) separate and proxied by
   Cloudflare as normal.
4. There is **no `NEXTAUTH_URL` to update** — the app doesn't use it. Cookies are set with
   relative paths, so the admin/Deepening login works on whatever domain serves the app.

---

## 8. Email deliverability (don't skip if registration is live)

- **Gmail:** enable 2FA on the sending account, create an **App Password**, use it as
  `SMTP_PASS`. Plain account passwords are rejected.
- Set `EMAIL_FROM` to an address at a domain you control and add **SPF/DKIM** records, or
  registrant emails will land in spam. A transactional provider (Resend, Postmark, SES)
  over SMTP gives far better deliverability than Gmail for outbound site mail.
- `lib/mail.ts` uses `port 587` with implicit STARTTLS and no `secure: true` — correct for
  587. If you switch to port 465, that code needs `secure: true` added.

---

## 9. Post-deploy verification checklist

Walk these on the live domain:

- [ ] Home page renders; parchment header texture visible; footer footprints load.
- [ ] **Images load from R2** — open an admin-uploaded image / album cover; confirm the URL
      is your `R2_PUBLIC_URL` host and `next/image` optimizes it (no broken-image icons,
      no `400` from `/_next/image`). A 400 here means the host isn't allowlisted → check
      `R2_PUBLIC_URL` is set and redeploy.
- [ ] **Music plays** — open an album, play a track; the `<audio>` src should be an R2 URL.
- [ ] **Album ZIP download** works for a small album (see §10 for the large-album caveat).
- [ ] **Admin login** — triple-click the navbar heart → `/admin/login`, sign in with
      `ADMIN_PASSWORD`. Create a test post; **upload an image** and confirm it lands on R2
      and renders.
- [ ] **Deepening gate** — visit `/deepen/deepening` logged out → password prompt; enter
      `DEEPENING_PASSWORD` → content unlocks. Confirm a `/assets/deepening/*.pdf` link
      redirects to the gate when logged out and serves when unlocked (validates the §0.1
      fix).
- [ ] **Mureed Directory** — `/mureeds-corner/directory` behind the gate; submit a test
      profile **with a photo**; confirm the photo uploads to R2 and the listing appears.
- [ ] **Contact form** sends; check `EMAIL_TO` inbox.
- [ ] **Retreat registration** (if a published retreat exists) sends both the registrant
      and admin emails.
- [ ] `/teachings` returns 404 and `/deepen` is the live library (rename is in effect).

---

## 10. Known limitations & gotchas

- **Large-album ZIP timeout.** `/api/music/[slug]/download` fetches every track from R2
  and streams a ZIP within one serverless invocation. Vercel function limits are ~10s on
  Hobby and up to 60s (configurable to 300s) on Pro. A big album (hundreds of MB) can
  exceed Hobby's limit. Mitigations: deploy on Pro and raise `maxDuration`, or pre-build
  per-album ZIPs and store them on R2, or link to R2 directly. Verify against your largest
  album.
- **Serverless DB connections.** Use the **pooled** `DATABASE_URL` (§1.1). The direct
  connection will exhaust under serverless concurrency. Use the direct URL only for
  one-off admin tasks (`prisma db push`, `pg_dump`/restore).
- **Preview deployments share env unless scoped.** If you enable Preview env vars with the
  prod `DATABASE_URL`, preview builds mutate production data. Give Preview its own DB or
  leave Preview env unset.
- **YouTube thumbnails** (`img.youtube.com`) are rendered with plain `<img>` today, so
  they don't need `next/image` allowlisting. If you ever switch a thumbnail to `<Image>`,
  add `img.youtube.com` (and `i.ytimg.com`) to `remotePatterns` in `next.config.ts`.
- **`STORAGE_PROVIDER` must equal `r2` in prod.** Any other value routes uploads to
  `writeFile` into `/public` — a read-only filesystem on Vercel — and every upload 500s.
- **Rotating `ADMIN_PASSWORD` or the session secret invalidates all admin sessions** (the
  cookie HMAC is derived from both). Expected behavior; just re-login after a rotation.

---

## Quick reference — deploy order

```
0. Apply §0 code fixes (proxy redirect, vercel.json, secret name) → commit → push
1. Provision Postgres (pooled), R2 bucket + API token + public URL, SMTP, domain
2. Vercel: import repo, Node 20.x, add all §3 env vars (STORAGE_PROVIDER=r2)
3. prisma db push + seed  (against prod DATABASE_URL)
4. npx tsx scripts/upload-music-r2.ts  (audio → R2, repoint 88 tracks)
5. Deploy → add domain
6. Walk the §9 checklist
```
