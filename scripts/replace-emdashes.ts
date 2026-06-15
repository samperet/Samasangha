/**
 * Find and contextually replace em dashes (—) in editorial DB content.
 *
 * The public long-form copy (teacher bios, talks, articles, editable pages,
 * etc.) lives in the database, edited via the admin CMS — not in the repo —
 * so em dashes there can only be fixed against a live database.
 *
 * Usage (needs DATABASE_URL set, e.g. a local .env or `vercel env pull`):
 *   npm run fix:emdashes            # DRY RUN — prints every change it would make
 *   npm run fix:emdashes -- --apply # actually writes the changes
 *
 * Replacement heuristics (em dash → context-appropriate punctuation):
 *   - between digits ............... en dash, e.g. "1969—1972" -> "1969–1972"
 *   - leading / attribution ........ dropped, e.g. ">— Author" -> ">Author"
 *   - spaced clause/parenthetical .. comma, "A — B — C" -> "A, B, C"
 *   - tight between words .......... comma + space, "word—word" -> "word, word"
 * Then collapses any doubled commas / spaces the swaps may introduce.
 *
 * The dry run shows before/after so you can spot any case the heuristic gets
 * wrong (a colon, parentheses, or a period may read better) and fix it by hand
 * in the admin instead.
 */
import { prisma } from "../lib/prisma";

const APPLY = process.argv.includes("--apply");

// Editorial content fields only — user-submitted text (Contact, Subscriber,
// EventRegistration, MureedProfile names) is intentionally left untouched.
const TARGETS: { model: string; fields: string[] }[] = [
  { model: "page", fields: ["title", "content", "metaDesc"] },
  { model: "post", fields: ["title", "content", "excerpt"] },
  { model: "event", fields: ["title", "description"] },
  { model: "album", fields: ["title", "description"] },
  { model: "track", fields: ["title"] },
  { model: "musicVideo", fields: ["title", "description"] },
  { model: "teacher", fields: ["bio"] },
  { model: "notification", fields: ["message"] },
];

function fix(text: string): string {
  let s = text;
  s = s.replace(/(\d)\s*—\s*(\d)/g, "$1–$2"); // numeric range -> en dash
  s = s.replace(/(^|>|\n)\s*—\s*/g, "$1"); // leading/attribution em dash -> drop
  s = s.replace(/\s+—\s+/g, ", "); // spaced clause -> comma
  s = s.replace(/—/g, ", "); // any remaining (tight) -> comma + space
  // tidy artifacts the swaps may create
  s = s.replace(/,\s*,/g, ",").replace(/\s+,/g, ",").replace(/[^\S\n]{2,}/g, " ");
  return s;
}

function snippet(before: string, after: string): string {
  const i = before.indexOf("—");
  const a = Math.max(0, i - 40);
  return `      before: …${before.slice(a, i + 41)}…\n      after:  …${after.slice(a, a + 81)}…`;
}

async function main() {
  let totalFields = 0;
  let totalDashes = 0;

  for (const { model, fields } of TARGETS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = (prisma as any)[model];
    if (!client) continue;
    const rows: Record<string, unknown>[] = await client.findMany();

    for (const row of rows) {
      const data: Record<string, string> = {};
      for (const f of fields) {
        const val = row[f];
        if (typeof val !== "string" || !val.includes("—")) continue;
        const fixed = fix(val);
        if (fixed === val) continue;
        data[f] = fixed;
        totalFields++;
        totalDashes += (val.match(/—/g) || []).length;
        console.log(`\n${model}#${row.id} · ${f}`);
        console.log(snippet(val, fixed));
      }
      if (APPLY && Object.keys(data).length) {
        await client.update({ where: { id: row.id }, data });
      }
    }
  }

  console.log(
    `\n${APPLY ? "APPLIED" : "DRY RUN"} — ${totalDashes} em dash(es) across ${totalFields} field(s).` +
      (APPLY ? "" : "\nRe-run with `-- --apply` to write these changes.")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
