import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";
import { apiSuccess, apiError, apiRateLimitError } from "@/lib/api-response";
import bcrypt from "bcryptjs";

/**
 * DELETE /api/me/delete-account
 * GDPR: Delete user account and all associated data (Right to Erasure)
 * 
 * Requires password confirmation for security
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`delete-account:${ip}`);
    if (!rl.allowed) {
      return apiRateLimitError(
        "Too many requests. Please try again later.",
        rl.remaining,
        rl.resetAt
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const userId = session.user.id;
    const body = await request.json();
    const { password, confirmation } = body;

    // Require explicit confirmation
    if (confirmation !== "DELETE MY ACCOUNT") {
      return apiError(
        'Please type "DELETE MY ACCOUNT" to confirm deletion',
        400
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, role: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Prevent admin deletion through this endpoint
    if (user.role === "admin" || user.role === "admin-main") {
      return apiError(
        "Admin accounts cannot be deleted through this endpoint. Contact support.",
        403
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return apiError("Invalid password", 401);
    }

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete messages first (FK constraint)
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // Delete conversations
      await tx.conversation.deleteMany({
        where: { userId },
      });

      // Delete contact messages
      await tx.contactMessage.deleteMany({
        where: { userId },
      });

      // Anonymize appointments (keep for business records but remove PII)
      await tx.appointment.updateMany({
        where: { userId },
        data: {
          userId: null,
          clientName: "[DELETED USER]",
          clientEmail: `deleted-${Date.now()}@anonymized.local`,
          clientPhone: null,
          notes: null,
        },
      });

      // Anonymize orders (keep for financial records but remove PII)
      await tx.order.updateMany({
        where: { userId },
        data: {
          userId: null,
          customerName: "[DELETED USER]",
          customerEmail: `deleted-${Date.now()}@anonymized.local`,
        },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Log deletion for audit
    console.log(`[GDPR] User account deleted: ${userId}`);

    return apiSuccess({
      message: "Your account and personal data have been deleted.",
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return apiError("Failed to delete account", 500);
  }
}
