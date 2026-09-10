import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkMailchimp } from "@/lib/mailchimp";

// Why signups aren't reaching Mailchimp. Admin-only: it reports on the API key
// and the audience, so it isn't something to leave open.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await checkMailchimp();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
