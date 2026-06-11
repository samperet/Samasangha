import { NextRequest, NextResponse } from "next/server";
import {
  DEEPENING_COOKIE,
  expectedDeepeningToken,
  getDeepeningPassword,
} from "@/lib/admin-token";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || password !== getDeepeningPassword()) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEEPENING_COOKIE, await expectedDeepeningToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return res;
}
