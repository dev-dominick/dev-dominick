import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/payments
 * List payment receipts with filters
 * 
 * Query params:
 * - method: STRIPE, CASH, ACH, WIRE, CHECK, OTHER
 * - status: PENDING, RECEIVED, FAILED, REFUNDED
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - limit: max results (default 50, max 200)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return apiError("Authentication required", 401);
    }

    if (token.role !== "admin" && token.role !== "admin-main") {
      return apiError("Admin access required", 403);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const method = searchParams.get("method")?.toUpperCase();
    const status = searchParams.get("status")?.toUpperCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10), 1), 200);

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (method) {
      where.method = method;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.receivedAt = {};
      if (startDate) {
        (where.receivedAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.receivedAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Fetch receipts
    const receipts = await prisma.paymentReceipt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        treasuryTransfers: {
          select: {
            id: true,
            status: true,
            amountCents: true,
            destinationAccount: true,
          },
        },
      },
    });

    // Get summary stats
    const stats = await prisma.paymentReceipt.groupBy({
      by: ["method", "status"],
      _sum: { amountCents: true },
      _count: true,
    });

    // Calculate totals
    const summary = {
      totalReceived: 0,
      totalPending: 0,
      byMethod: {} as Record<string, { count: number; amountUsd: number }>,
    };

    stats.forEach((s) => {
      const amountUsd = (s._sum.amountCents || 0) / 100;
      
      if (s.status === "RECEIVED") {
        summary.totalReceived += amountUsd;
      } else if (s.status === "PENDING") {
        summary.totalPending += amountUsd;
      }

      if (!summary.byMethod[s.method]) {
        summary.byMethod[s.method] = { count: 0, amountUsd: 0 };
      }
      summary.byMethod[s.method].count += s._count;
      summary.byMethod[s.method].amountUsd += amountUsd;
    });

    // Format response
    const formattedReceipts = receipts.map((r) => ({
      id: r.id,
      method: r.method,
      amountUsd: r.amountCents / 100,
      amountCents: r.amountCents,
      currency: r.currency,
      status: r.status,
      receivedAt: r.receivedAt,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      description: r.description,
      notes: r.notes,
      externalRef: r.externalRef,
      createdAt: r.createdAt,
      treasuryTransfers: r.treasuryTransfers,
    }));

    return apiSuccess({
      receipts: formattedReceipts,
      summary,
      count: receipts.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return apiError("Failed to fetch payments", 500);
  }
}
