// Sync the Prisma schema to the database during build, but never fail the
// build if the database is briefly unreachable or the sync can't run. The app
// degrades gracefully (e.g. site design falls back to defaults) until the next
// successful sync. Run `npm run db:push` manually to force a sync.
import { execSync } from "node:child_process";

try {
  // No --skip-generate: Prisma 7 removed the flag, and passing it made this
  // command fail its usage check on every build, so the schema never synced.
  // `prisma generate` already runs ahead of this in the build script.
  execSync("npx prisma db push", { stdio: "inherit" });
} catch {
  console.warn(
    "\n⚠  prisma db push did not complete — continuing the build.\n" +
      "   The app will use safe fallbacks. Run `npm run db:push` once the\n" +
      "   database is reachable to apply any schema changes.\n",
  );
}
