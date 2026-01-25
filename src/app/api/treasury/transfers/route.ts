import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { validateAmount } from "@/lib/validators";

const VALID_SOURCE_ACCOUNTS = ["FULTON_BANK", "STRIPE_BALANCE", "CASH_ON_HAND"];
const VALID_DESTINATION_ACCOUNTS = ["KRAKEN", "COINBASE", "OTHER"];
const VALID_METHODS = ["ACH", "WIRE"];

/**
 * POST /api/treasury/transfers
 * Create a treasury transfer (Fulton Bank -> Kraken)
 * 
 * Admin only
 * Body: { amountUsd, sourceAccount, destinationAccount?, method, paymentReceiptId?, notes? }
 */
export async function POST(request: NextRequest) {
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

    const userId = token.sub;
    const body = await request.json();

    const {
      amountUsd,
      sourceAccount,
      destinationAccount = "KRAKEN",
      method,
      paymentReceiptId,
      notes,
    } = body;

    // Validate required fields
    if (!amountUsd) {
      return apiError("Amount is required", 400);
    }
    if (!sourceAccount) {
      return apiError("Source account is required", 400);
    }
    if (!method) {
      return apiError("Transfer method is required", 400);
    }

    // Validate enums
    const upperSource = sourceAccount.toUpperCase();
    const upperDest = destinationAccount.toUpperCase();
    const upperMethod = method.toUpperCase();

    if (!VALID_SOURCE_ACCOUNTS.includes(upperSource)) {
      return apiError(`Invalid source. Must be one of: ${VALID_SOURCE_ACCOUNTS.join(", ")}`, 400);
    }
    if (!VALID_DESTINATION_ACCOUNTS.includes(upperDest)) {
      return apiError(`Invalid destination. Must be one of: ${VALID_DESTINATION_ACCOUNTS.join(", ")}`, 400);
    }
    if (!VALID_METHODS.includes(upperMethod)) {
      return apiError(`Invalid method. Must be one of: ${VALID_METHODS.join(", ")}`, 400);
    }

    // Validate amount
    let validatedAmount: number;
    try {
      validatedAmount = validateAmount(amountUsd, "Amount");
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Invalid amount", 400);
    }

    if (validatedAmount < 1) {
      return apiError("Minimum transfer is $1", 400);
    }

    const amountCents = Math.round(validatedAmount * 100);

    // Validate payment receipt if provided
    if (paymentReceiptId) {
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: paymentReceiptId },
      });
      if (!receipt) {
        return apiError("Payment receipt not found", 404);
      }
    }

    // Create transfer with PLANNED status
    const transfer = await prisma.treasuryTransfer.create({
      data: {
        userId,
        sourceAccount: upperSource,
        destinationAccount: upperDest,
        method: upperMethod,
        amountCents,
        currency: "USD",
        status: "PLANNED",
        plannedAt: new Date(),
        paymentReceiptId: paymentReceiptId || null,
        notes: notes || null,
      },
    });

    console.log(`[TREASURY] Transfer planned: $${validatedAmount.toFixed(2)} ${upperSource} -> ${upperDest} via ${upperMethod}`);

    return apiSuccess({
      transfer: {
        id: transfer.id,
        sourceAccount: transfer.sourceAccount,
        destinationAccount: transfer.destinationAccount,
        method: transfer.method,
        amountUsd: transfer.amountCents / 100,
        amountCents: transfer.amountCents,
        status: transfer.status,
        plannedAt: transfer.plannedAt,
      },
    }, 201);
  } catch (error) {
    console.error("Error creating treasury transfer:", error);
    return apiError("Failed to create transfer", 500);
  }
}

/**
 * GET /api/treasury/transfers
 * List treasury transfers with filters
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase();
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10), 1), 200);

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const transfers = await prisma.treasuryTransfer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        paymentReceipt: {
          select: {
            id: true,
            method: true,
            amountCents: true,
            clientName: true,
          },
        },
      },
    });

    // Summary stats
    const stats = await prisma.treasuryTransfer.groupBy({
      by: ["status"],
      _sum: { amountCents: true },
      _count: true,
    });

    const summary = {
      planned: 0,
      submitted: 0,
      confirmed: 0,
    };

    stats.forEach((s) => {
      const amountUsd = (s._sum.amountCents || 0) / 100;
      if (s.status === "PLANNED") summary.planned = amountUsd;
      if (s.status === "SUBMITTED") summary.submitted = amountUsd;
      if (s.status === "CONFIRMED") summary.confirmed = amountUsd;
    });

    const formattedTransfers = transfers.map((t) => ({
      id: t.id,
      sourceAccount: t.sourceAccount,
      destinationAccount: t.destinationAccount,
      method: t.method,
      amountUsd: t.amountCents / 100,
      amountCents: t.amountCents,
      status: t.status,
      plannedAt: t.plannedAt,
      submittedAt: t.submittedAt,
      confirmedAt: t.confirmedAt,
      bankRef: t.bankRef,
      krakenRef: t.krakenRef,
      notes: t.notes,
      paymentReceipt: t.paymentReceipt,
      createdAt: t.createdAt,
    }));

    return apiSuccess({
      transfers: formattedTransfers,
      summary,
      count: transfers.length,
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return apiError("Failed to fetch transfers", 500);
  }
}
