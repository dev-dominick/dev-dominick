import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

/**
 * POST /api/dev/admin-session
 * Dev-only endpoint to create a mock admin session
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  
  // Create a JWT token for dev admin
  const token = await new SignJWT({
    sub: "dev-admin-user",
    email: "dev@admin.local",
    role: "admin-main",
    name: "Dev Admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  // Set NextAuth session cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("next-auth.session-token", token, {
    httpOnly: true,
    secure: false, // http in dev
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}

/**
 * DELETE /api/dev/admin-session
 * Clear the dev admin session
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("next-auth.session-token");
  
  return response;
}
