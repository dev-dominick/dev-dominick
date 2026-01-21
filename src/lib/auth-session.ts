import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

const SESSION_COOKIE_NAME = "next-auth.session-token";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function issueSessionResponse(
  body: unknown,
  user: SessionUser,
  status = 200
) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required to issue sessions");
  }

  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    },
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: MAX_AGE,
  });

  const res = NextResponse.json(body, { status });
  res.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions());
  return res;
}

export function clearSessionResponse() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
