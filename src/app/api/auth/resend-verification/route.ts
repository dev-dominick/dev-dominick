import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailVerificationEmail } from "@/lib/email";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";
import { apiSuccess, apiError, apiRateLimitError } from "@/lib/api-response";

/**
 * POST /api/auth/resend-verification
 * Resend verification email to user
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`resend-verification:${ip}`);
    if (!rl.allowed) {
      return apiRateLimitError(
        "Too many requests. Please try again later.",
        rl.remaining,
        rl.resetAt
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return apiError("Email is required", 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    // Don't reveal if user exists - always return success
    if (!user) {
      return apiSuccess({
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return apiSuccess({
        message: "Email is already verified.",
        verified: true,
      });
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || "https://dev-dominick.com";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    const emailHtml = emailVerificationEmail({ verificationUrl });

    const result = await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: emailHtml,
    });

    if (!result.success) {
      console.error("Failed to send verification email:", result.error);
      return apiError("Failed to send verification email", 500);
    }

    return apiSuccess({
      message: "If an account exists with this email, a verification link has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return apiError("Failed to send verification email", 500);
  }
}
