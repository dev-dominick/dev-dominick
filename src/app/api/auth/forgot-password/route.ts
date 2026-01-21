import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid email address",
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // (Don't reveal if email exists in system)
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const resetToken = randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // In production, you would send an email here
    // For development, we'll log the reset link
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("\n🔐 Password Reset Link (DEV MODE):");
      console.log(`   Email: ${email}`);
      console.log(`   Link: ${resetUrl}`);
      console.log(`   Expires: ${resetExpires.toLocaleString()}\n`);
    }

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      message:
        "If an account exists with that email, a reset link has been sent.",
      // In dev mode, include the reset URL for testing
      ...(process.env.NODE_ENV !== "production" && { resetUrl }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
