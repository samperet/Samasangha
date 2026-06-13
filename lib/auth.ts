import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-token";

export { ADMIN_COOKIE, expectedSessionToken, getAdminPassword, verifySessionToken } from "@/lib/admin-token";

/** Drop-in replacement for the old NextAuth `auth()`, truthy when signed in. */
export async function auth() {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  return ok ? { admin: true as const } : null;
}
