// Single-password admin auth — pure token helpers, no Next.js imports,
// so this module is safe in both proxy (edge) and route handlers.
// The session cookie holds an HMAC derived from ADMIN_PASSWORD + secret,
// so changing either invalidates all sessions.

export const ADMIN_COOKIE = "admin_session";
export const DEEPENING_COOKIE = "deepening_session";

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "samasangha-dev-secret"
  );
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function getDeepeningPassword() {
  return process.env.DEEPENING_PASSWORD ?? "AHHA";
}

async function hmacToken(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionToken(): Promise<string> {
  return hmacToken(`samasangha-admin-v1:${getAdminPassword()}`);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !getAdminPassword()) return false;
  return token === (await expectedSessionToken());
}

export async function expectedDeepeningToken(): Promise<string> {
  return hmacToken(`samasangha-deepening-v1:${getDeepeningPassword()}`);
}

export async function verifyDeepeningToken(token: string | undefined): Promise<boolean> {
  if (!token || !getDeepeningPassword()) return false;
  return token === (await expectedDeepeningToken());
}
