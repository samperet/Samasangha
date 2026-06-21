// Sync the Prisma schema to the database during build, but never fail the
// build if the database is briefly unreachable or the sync can't run. The app
// degrades gracefully (e.g. site design falls back to defaults) until the next
// successful sync. Run `npm run db:push` manually to force a sync.
import { execSync } from "node:child_process";

try {
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
} catch {
  console.warn(
    "\n⚠  prisma db push did not complete — continuing the build.\n" +
      "   The app will use safe fallbacks. Run `npm run db:push` once the\n" +
      "   database is reachable to apply any schema changes.\n",
  );
}
