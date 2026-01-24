import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { issueSessionResponse } from "@/lib/auth-session";
import { loginRateLimiter } from "@/lib/rate-limit";

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin") || "";
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const baseUrl = process.env.NEXTAUTH_URL || "";
  if (baseUrl) {
    try {
      const u = new URL(baseUrl);
      allowed.push(`${u.protocol}//${u.host}`);
    } catch {}
  }
  return allowed.length === 0 ? true : allowed.includes(origin);
}

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF mitigation: require requests originate from allowed origin
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(',')[0].trim() ||
      request.headers.get("x-real-ip") ||
      (request as any).ip ||
      "unknown";
    const rl = loginRateLimiter.check(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((err) => ({
            field: err.path.map(String).join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true },
    });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Ensure admin role for dev bootstrap if ADMIN_EMAIL matches
    const isAdminBootstrap =
      process.env.NODE_ENV !== "production" &&
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

    const role = isAdminBootstrap ? "admin" : (user.role || "user");

    return issueSessionResponse(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        },
      },
      { id: user.id, email: user.email, name: user.name, role }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
