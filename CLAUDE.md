@AGENTS.md

# SamaSangha Website

Full-stack Next.js community website for Northeast Sufis / SamaSangha (Massachusetts).

## Tech Stack
- Next.js 15 App Router + TypeScript + Tailwind CSS
- PostgreSQL + Prisma v7 (uses `@prisma/adapter-pg` — no URL in schema.prisma, configured in prisma.config.ts)
- Admin auth: single site password (`ADMIN_PASSWORD` env) + signed cookie — see lib/admin-token.ts and proxy.ts. No user accounts. Triple-click the navbar heart on the public site to reach the login.
- Tiptap rich text editor
- File storage: local dev (`/public/uploads/`) or Cloudflare R2 via `STORAGE_PROVIDER=r2`
- Nodemailer for contact form emails

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL

# 3. Push schema to DB
npm run db:push

# 4. Seed starter retreat rooms
npm run seed
# Admin login password comes from ADMIN_PASSWORD in .env

# 5. Run dev server
npm run dev
```

## Key Commands
```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run db:push      # Push schema without migrations
npm run db:migrate   # Create and run migration
npm run db:studio    # Prisma Studio GUI
npm run seed         # Seed starter retreat rooms
```

## Structure
```
app/
  (public)/          # Public-facing pages (wrapped in Navbar + Footer)
  admin/             # CMS dashboard (protected by proxy.ts)
  api/
    admin/           # CRUD API routes (auth-gated, incl. login + rooms)
    contact/         # Public contact form
    subscribe/       # Mailing list signup
    upload/          # File upload
components/
  public/            # Navbar, Footer, SubscribeForm
  admin/             # Sidebar, RichTextEditor, DeleteButton
lib/
  prisma.ts          # Prisma client singleton
  auth.ts            # NextAuth config
  storage.ts         # Local/R2 file upload abstraction
  mail.ts            # Nodemailer
  utils.ts           # cn(), slugify(), formatDate()
prisma/
  schema.prisma      # DB models
  seed.ts            # Admin user seeder
```

## Admin Routes
| Route | Purpose |
|---|---|
| /admin | Dashboard with stats |
| /admin/events | CRUD events |
| /admin/posts | CRUD posts (Dharma Gems, Talks, etc.) |
| /admin/albums | CRUD albums + tracks |
| /admin/teachers | CRUD teacher bios |
| /admin/media | File upload library |
| /admin/contacts | Contact form inbox |
| /admin/subscribers | Mailing list |

## Deployment (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables (DATABASE_URL, ADMIN_SESSION_SECRET, ADMIN_PASSWORD, DEEPENING_PASSWORD, SMTP_*, etc. — see DEPLOYMENT.md §3 for the full set)
4. For R2 storage: set STORAGE_PROVIDER=r2 and R2_* vars

## Prisma v7 Notes
- URL is NOT in schema.prisma — it goes in prisma.config.ts (for CLI) and is passed via `STORAGE_PROVIDER` env var
- PrismaClient requires `@prisma/adapter-pg` — see lib/prisma.ts
- After schema changes: `npx prisma generate` then `npm run db:push` or `npm run db:migrate`
