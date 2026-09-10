import { createHash } from "node:crypto";

/**
 * Mailchimp Marketing API v3, just the one call the site needs: put an address
 * on the audience.
 *
 * The data centre prefix ("us2") is the part of the API key after the dash, so
 * it normally doesn't need setting separately — MAILCHIMP_SERVER_PREFIX is only
 * there as an override.
 */
const API_KEY = process.env.MAILCHIMP_API_KEY ?? "";
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? "";
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || API_KEY.split("-")[1] || "";

export function isMailchimpConfigured(): boolean {
  return Boolean(API_KEY && AUDIENCE_ID && SERVER_PREFIX);
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "compliance" | "invalid" | "failed"; message: string };

/** Everything Mailchimp says about a failure, flattened into one line for the log. */
type MailchimpError = {
  title: string;
  detail: string;
  /** Per-field complaints, e.g. FNAME is a required merge field on this audience. */
  fieldErrors: { field: string; message: string }[];
};

function readError(body: unknown): MailchimpError {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors = Array.isArray(b.errors) ? b.errors : [];
  return {
    title: typeof b.title === "string" ? b.title : "",
    detail: typeof b.detail === "string" ? b.detail : "",
    fieldErrors: errors.map((e) => {
      const r = (e ?? {}) as Record<string, unknown>;
      return { field: String(r.field ?? ""), message: String(r.message ?? "") };
    }),
  };
}

/** Mailchimp identifies a member by the MD5 of their lower-cased address. */
function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

// ── Merge tags ─────────────────────────────────────────────────────────────
// FNAME and LNAME are only the *defaults*. Delete and recreate a field in
// Mailchimp and it comes back as MMERGE2, MMERGE3 and so on, so the tag for
// "Last" can be anything. Sending a tag the audience doesn't have means the
// value is dropped, or the signup rejected outright when the field is
// required — so ask the audience what its tags are instead of assuming.

export type MergeField = { tag: string; name: string; required: boolean };

function authHeader() {
  return { Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}` };
}

function listUrl(path = "") {
  return `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}${path}`;
}

export async function fetchMergeFields(): Promise<MergeField[] | null> {
  try {
    const res = await fetch(listUrl("/merge-fields?count=100"), {
      headers: authHeader(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const raw = (await res.json())?.merge_fields;
    if (!Array.isArray(raw)) return null;
    return (raw as Record<string, unknown>[]).map((f) => ({
      tag: String(f.tag),
      name: String(f.name),
      required: f.required === true,
    }));
  } catch {
    return null;
  }
}

export type MergeTags = { first: string | null; last: string | null };

/** Match on the tag first, then on what the field is called. */
function pickTag(fields: MergeField[], preferred: string, nameMatch: RegExp): string | null {
  const byTag = fields.find((f) => f.tag === preferred);
  if (byTag) return byTag.tag;
  const byName = fields.find((f) => nameMatch.test(f.name));
  return byName ? byName.tag : null;
}

export function resolveMergeTags(fields: MergeField[]): MergeTags {
  return {
    first: pickTag(fields, "FNAME", /^\s*(first|given)/i),
    last: pickTag(fields, "LNAME", /^\s*(last|surname|family)/i),
  };
}

// One lookup serves every signup this instance handles. Short-lived, because a
// field renamed in Mailchimp should not need a redeploy to take effect.
const TAG_CACHE_MS = 15 * 60 * 1000;
let tagCache: { tags: MergeTags; at: number } | null = null;

async function getMergeTags(): Promise<MergeTags> {
  if (tagCache && Date.now() - tagCache.at < TAG_CACHE_MS) return tagCache.tags;
  const fields = await fetchMergeFields();
  // Couldn't ask: fall back to the defaults rather than sending no name at all.
  const tags = fields ? resolveMergeTags(fields) : { first: "FNAME", last: "LNAME" };
  if (fields) tagCache = { tags, at: Date.now() };
  return tags;
}

/**
 * Add the address to the audience, or leave it alone if it's already there.
 *
 * PUT rather than POST: POST fails with "Member Exists" for anyone who signs up
 * twice, which is a normal thing for a person to do and shouldn't look like an
 * error to them.
 */
export async function subscribeToMailchimp(
  email: string,
  name?: { firstName?: string; lastName?: string }
): Promise<SubscribeResult> {
  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash(email)}`;

  // Ask the audience which tags it uses, then only send a tag we have a value
  // for — an empty string still counts as empty against a required field, so
  // it would fail the same way as sending nothing.
  const tags = await getMergeTags();
  const merge_fields: Record<string, string> = {};
  if (tags.first && name?.firstName?.trim()) merge_fields[tags.first] = name.firstName.trim();
  if (tags.last && name?.lastName?.trim()) merge_fields[tags.last] = name.lastName.trim();

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        // The API takes any username with the key as the password.
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        status_if_new: "subscribed",
        ...(Object.keys(merge_fields).length ? { merge_fields } : {}),
      }),
      // Don't let a slow Mailchimp hold the visitor's request open.
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[mailchimp] request failed", err);
    return { ok: false, reason: "failed", message: "Could not reach Mailchimp." };
  }

  if (res.ok) return { ok: true };

  const err = readError(await res.json().catch(() => null));
  // Log everything Mailchimp said — the field errors are usually the whole story
  // (a required merge field on the audience, say), and without them a 400 is a
  // mystery.
  console.error(
    "[mailchimp] %d %s — %s%s",
    res.status,
    err.title || "(no title)",
    err.detail || "(no detail)",
    err.fieldErrors.length
      ? " | fields: " + err.fieldErrors.map((f) => `${f.field}: ${f.message}`).join("; ")
      : ""
  );

  // Someone who unsubscribed, or was cleaned off the list, can only come back
  // by their own hand — Mailchimp won't let the API re-subscribe them.
  if (/compliance|forgotten|permanently deleted/i.test(err.title)) {
    return {
      ok: false,
      reason: "compliance",
      message:
        "That address unsubscribed previously, so Mailchimp needs you to re-join from one of their emails. Write to us and we'll help.",
    };
  }

  // A complaint about merge fields means our cached tags are stale — the
  // audience has been edited since we looked. Drop them so the next signup
  // asks again rather than repeating the same mistake for fifteen minutes.
  if (err.fieldErrors.some((f) => f.field !== "email_address") || /merge/i.test(err.detail)) {
    tagCache = null;
  }

  // Only blame the address when Mailchimp actually blamed the address. A 400
  // about a required merge field, or a misconfigured audience, is our problem,
  // not the visitor's, and telling them to check their typing sends them in
  // circles.
  const aboutTheAddress =
    err.fieldErrors.some((f) => f.field === "email_address") ||
    /email address/i.test(err.detail);

  if (res.status === 400 && aboutTheAddress) {
    return {
      ok: false,
      reason: "invalid",
      message: "Mailchimp didn't recognise that as a valid email address.",
    };
  }

  return {
    ok: false,
    reason: "failed",
    message: "We couldn't complete the signup just now. Please try again, or email us.",
  };
}

// ── Diagnostics ────────────────────────────────────────────────────────────
// Signups fail behind the scenes, where the only evidence is a server log. This
// checks the three things that actually go wrong — the key, the audience id,
// and merge fields the audience insists on — and says so in plain words.

export type MailchimpCheck = {
  ok: boolean;
  problem?: string;
  fix?: string;
  config: { apiKey: string; serverPrefix: string; audienceId: string };
  audience?: { name: string; members: number };
  /** Everything the audience defines, so a renamed or missing tag is visible. */
  mergeFields?: { tag: string; name: string; required: boolean }[];
  /** Required fields the signup form has no value for — these block every signup. */
  unsatisfiedMergeFields?: { tag: string; name: string }[];
  /** The tags the form will actually write the two names to. */
  nameTags?: MergeTags;
};

export async function checkMailchimp(): Promise<MailchimpCheck> {
  // Never echo the key itself, only enough of its shape to spot a bad paste.
  const config = {
    apiKey: API_KEY ? `set (${API_KEY.length} chars, ends "-${SERVER_PREFIX}")` : "MISSING",
    serverPrefix: SERVER_PREFIX || "MISSING",
    audienceId: AUDIENCE_ID || "MISSING",
  };

  if (!isMailchimpConfigured()) {
    return {
      ok: false,
      problem: "Mailchimp isn't configured, so signups are only saved locally.",
      fix: "Set MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID in Vercel, then redeploy.",
      config,
    };
  }

  const headers = authHeader();
  const base = listUrl();

  let listRes: Response;
  try {
    listRes = await fetch(base, { headers, signal: AbortSignal.timeout(8000) });
  } catch {
    return { ok: false, problem: "Could not reach Mailchimp at all.", config };
  }

  if (listRes.status === 401) {
    return {
      ok: false,
      problem: "Mailchimp rejected the API key.",
      fix: "Re-copy the key from Account & billing → Extras → API keys. Check for a stray space, and that the key hasn't been disabled.",
      config,
    };
  }
  if (listRes.status === 404) {
    return {
      ok: false,
      problem: `No audience with the id "${AUDIENCE_ID}" in this account.`,
      fix: "Audience → Settings → 'Audience name and defaults' → Audience ID. Note this is not the u= value from the old signup link.",
      config,
    };
  }
  if (!listRes.ok) {
    const err = readError(await listRes.json().catch(() => null));
    return { ok: false, problem: `Mailchimp returned ${listRes.status}: ${err.title}`, config };
  }

  const list = await listRes.json();
  const audience = {
    name: String(list?.name ?? "(unnamed)"),
    members: Number(list?.stats?.member_count ?? 0),
  };

  const mergeFields = (await fetchMergeFields()) ?? [];
  // Whichever tags this audience actually uses for the two names — they are
  // only FNAME/LNAME by default, and a recreated field comes back as MMERGE2.
  const nameTags = resolveMergeTags(mergeFields);
  const supplied = [nameTags.first, nameTags.last].filter(Boolean) as string[];

  // Those two are filled by the form, so requiring them is fine. Anything else
  // the audience insists on has no value to send, and blocks every signup.
  const unsatisfiedMergeFields = mergeFields
    .filter((f) => f.required && f.tag !== "EMAIL" && !supplied.includes(f.tag))
    .map(({ tag, name }) => ({ tag, name }));

  if (unsatisfiedMergeFields.length) {
    const tags = unsatisfiedMergeFields.map((f) => f.tag).join(", ");
    return {
      ok: false,
      problem: `The audience requires ${tags}, which the signup form doesn't collect, so Mailchimp rejects every signup.`,
      fix: "In Mailchimp: Audience → Settings → Audience fields and *|MERGE|* tags, untick 'Required' for those fields. (Or ask for the form to collect them.)",
      config,
      audience,
      mergeFields,
      unsatisfiedMergeFields,
      nameTags,
    };
  }

  // If no field looks like a name at all, the names the form collects have
  // nowhere to go — they would be dropped without an error.
  const missing = [
    !nameTags.first ? "first name" : null,
    !nameTags.last ? "last name" : null,
  ].filter(Boolean);
  if (missing.length) {
    return {
      ok: false,
      problem: `The audience has no ${missing.join(" or ")} field, so that part of every signup would be discarded.`,
      fix: "Add the field under Audience → Settings → Audience fields and *|MERGE|* tags, naming it \"First Name\" / \"Last Name\" so it is recognised.",
      config,
      audience,
      mergeFields,
      nameTags,
    };
  }

  return { ok: true, config, audience, mergeFields, unsatisfiedMergeFields: [], nameTags };
}
