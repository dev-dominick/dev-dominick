import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/payments/stripe/deposits
 * List user's deposits with status information
 * 
 * Query params:
 * - status: filter by status (pending, completed, failed, refunded)
 * - limit: max results (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return apiError("Authentication required", 401);
    }

    const userId = token.sub;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "20", 10), 1), 100);

    // Build where clause
    const where: { userId: string; status?: string } = { userId };
    if (status) {
      where.status = status;
    }

    // Fetch deposits with related Deposit record
    const stripeDeposits = await prisma.stripeDeposit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        deposit: {
          select: {
            id: true,
            status: true,
            krakenOrderId: true,
            settledAt: true,
            settlementNotes: true,
          },
        },
      },
    });

    // Format response
    const deposits = stripeDeposits.map((sd) => ({
      id: sd.id,
      amountUsd: sd.amountUsd / 100, // Convert cents to dollars
      amountCents: sd.amountUsd,
      status: sd.status,
      stripeSessionId: sd.stripeSessionId,
      createdAt: sd.createdAt,
      completedAt: sd.completedAt,
      settlement: sd.deposit
        ? {
            id: sd.deposit.id,
            status: sd.deposit.status,
            krakenOrderId: sd.deposit.krakenOrderId,
            settledAt: sd.deposit.settledAt,
            notes: sd.deposit.settlementNotes,
          }
        : null,
    }));

    // Get summary stats
    const stats = await prisma.stripeDeposit.groupBy({
      by: ["status"],
      where: { userId },
      _sum: { amountUsd: true },
      _count: true,
    });

    const summary = {
      totalDeposited: 0,
      pendingAmount: 0,
      completedCount: 0,
    };

    stats.forEach((s) => {
      if (s.status === "completed") {
        summary.totalDeposited = (s._sum.amountUsd || 0) / 100;
        summary.completedCount = s._count;
      } else if (s.status === "pending") {
        summary.pendingAmount = (s._sum.amountUsd || 0) / 100;
      }
    });

    return apiSuccess({
      deposits,
      summary,
      count: deposits.length,
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return apiError("Failed to fetch deposits", 500);
  }
}

/**
 * GET /api/payments/stripe/deposits/[id]
 * Get a specific deposit by ID
 */
export async function getDepositById(depositId: string, userId: string) {
  const deposit = await prisma.stripeDeposit.findFirst({
    where: {
      id: depositId,
      userId,
    },
    include: {
      deposit: true,
    },
  });

  return deposit;
}
