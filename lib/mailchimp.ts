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

/** Mailchimp identifies a member by the MD5 of their lower-cased address. */
function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

/**
 * Add the address to the audience, or leave it alone if it's already there.
 *
 * PUT rather than POST: POST fails with "Member Exists" for anyone who signs up
 * twice, which is a normal thing for a person to do and shouldn't look like an
 * error to them.
 */
export async function subscribeToMailchimp(email: string): Promise<SubscribeResult> {
  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash(email)}`;

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
      }),
      // Don't let a slow Mailchimp hold the visitor's request open.
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[mailchimp] request failed", err);
    return { ok: false, reason: "failed", message: "Could not reach Mailchimp." };
  }

  if (res.ok) return { ok: true };

  const detail = await res.json().catch(() => null);
  const title = typeof detail?.title === "string" ? detail.title : "";
  console.error("[mailchimp] %d %s", res.status, title || (await res.text().catch(() => "")));

  // Someone who unsubscribed, or was cleaned off the list, can only come back
  // by their own hand — Mailchimp won't let the API re-subscribe them.
  if (/compliance|forgotten|permanently deleted/i.test(title)) {
    return {
      ok: false,
      reason: "compliance",
      message:
        "That address unsubscribed previously, so Mailchimp needs you to re-join from one of their emails. Write to us and we'll help.",
    };
  }

  if (res.status === 400) {
    return { ok: false, reason: "invalid", message: "Mailchimp wouldn't accept that address." };
  }

  return { ok: false, reason: "failed", message: "Mailchimp returned an error." };
}
