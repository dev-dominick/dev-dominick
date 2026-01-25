import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify user's email address using the verification token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return apiError("Missing verification token", 400);
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        verificationTokenExpiry: true,
      },
    });

    if (!user) {
      return apiError("Invalid verification token", 400);
    }

    // Check if already verified
    if (user.emailVerified) {
      return apiSuccess({
        message: "Email already verified",
        verified: true,
      });
    }

    // Check if token has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return apiError("Verification token has expired. Please request a new one.", 400);
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return apiSuccess({
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return apiError("Failed to verify email", 500);
  }
}
