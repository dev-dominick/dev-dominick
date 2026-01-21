import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";
import { issueSessionResponse } from "@/lib/auth-session";

/**
 * Signup API Route with Bot Protection
 * 
 * Security measures:
 * - Rate limiting: 3 attempts per hour per IP
 * - User-Agent validation and bot pattern detection
 * - Password strength requirements (10+ chars, uppercase, lowercase, number)
 * - Client-side honeypot field (checked on frontend)
 * - Client-side timing check (min 3 seconds to fill form)
 * - Email uniqueness validation
 * - Bcrypt password hashing (12 rounds)
 */

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Bot detection: Check User-Agent
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Bot detection: Block common bot user agents
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
    ];
    
    if (botPatterns.some((pattern) => pattern.test(userAgent))) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitResult = signupRateLimiter.check(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // Parse and validate request body without throwing
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = parsed.data;

    const isAdminBootstrap =
      process.env.NODE_ENV !== "production" &&
      process.env.ADMIN_EMAIL &&
      validatedData.email.toLowerCase() ===
        process.env.ADMIN_EMAIL.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: isAdminBootstrap ? "admin" : "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    // Reset rate limit on successful signup
    signupRateLimiter.reset(ip);

    return issueSessionResponse(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (error) {
    // Handle validation errors
    // Handle unexpected errors
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup. Please try again." },
      { status: 500 }
    );
  }
}
