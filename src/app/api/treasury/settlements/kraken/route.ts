import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { validateAmount } from "@/lib/validators";

const VALID_SOURCE_ACCOUNTS = ["FULTON_BANK", "STRIPE_BALANCE", "CASH_ON_HAND"];
const VALID_METHODS = ["ACH", "WIRE"];

interface KrakenSettlementBody {
  amountUsd: number;
  sourceAccount?: string;
  method?: string;
  paymentReceiptId?: string;
  notes?: string;
  dryRun?: boolean;
  account?: string;
}

/**
 * POST /api/treasury/settlements/kraken
 * Admin-only: create a treasury transfer and submit a settlement request to apple-pie.
 * Defaults to dry-run on the trading server; live mode requires flipping env flags there.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return apiError("Authentication required", 401);
    }
    if (token.role !== "admin" && token.role !== "admin-main") {
      return apiError("Admin access required", 403);
    }

    const body = (await request.json()) as KrakenSettlementBody;
    const {
      amountUsd,
      sourceAccount = "CASH_ON_HAND",
      method = "WIRE",
      paymentReceiptId,
      notes,
      dryRun = true,
      account,
    } = body;

    if (!amountUsd) {
      return apiError("Amount is required", 400);
    }

    const upperSource = sourceAccount.toUpperCase();
    const upperMethod = method.toUpperCase();

    if (!VALID_SOURCE_ACCOUNTS.includes(upperSource)) {
      return apiError(
        `Invalid source account. Must be one of: ${VALID_SOURCE_ACCOUNTS.join(", ")}`,
        400
      );
    }

    if (!VALID_METHODS.includes(upperMethod)) {
      return apiError(`Invalid method. Must be one of: ${VALID_METHODS.join(", ")}`, 400);
    }

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

    if (paymentReceiptId) {
      const receipt = await prisma.paymentReceipt.findUnique({ where: { id: paymentReceiptId } });
      if (!receipt) {
        return apiError("Payment receipt not found", 404);
      }
    }

    const transfer = await prisma.treasuryTransfer.create({
      data: {
        userId: token.sub,
        sourceAccount: upperSource,
        destinationAccount: "KRAKEN",
        method: upperMethod,
        amountCents,
        currency: "USD",
        status: "PLANNED",
        plannedAt: new Date(),
        paymentReceiptId: paymentReceiptId || null,
        notes: notes || null,
      },
    });

    const appleBase = process.env.APPLE_PIE_API_URL || "https://api.smarttoolsapi.com";
    const appleApiKey = process.env.APPLE_PIE_API_KEY;
    const appleAccount = account || process.env.APPLE_PIE_ACCOUNT || "testbot";

    if (!appleApiKey) {
      return apiError("APPLE_PIE_API_KEY is not configured", 500);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const payload = {
      transferId: transfer.id,
      amountCents,
      currency: "USD",
      account: appleAccount,
      dryRun: Boolean(dryRun),
      sourceAccount: upperSource,
      method: upperMethod,
      paymentReceiptId: paymentReceiptId || undefined,
      notes: notes || undefined,
    };

    let upstreamOk = false;
    let upstreamData: Record<string, unknown> | null = null;
    let upstreamError = "";

    try {
      const res = await fetch(`${appleBase}/api/v1/treasury/kraken/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": appleApiKey,
          "Idempotency-Key": transfer.id,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        upstreamError = `apple-pie responded ${res.status}`;
      } else {
        upstreamOk = true;
        upstreamData = await res.json();
      }
    } catch (err) {
      clearTimeout(timeout);
      upstreamError = err instanceof Error ? err.message : "Unknown upstream error";
    }

    if (!upstreamOk) {
      await prisma.treasuryTransfer.update({
        where: { id: transfer.id },
        data: {
          notes: [transfer.notes, `apple-pie error: ${upstreamError}`].filter(Boolean).join(" | "),
        },
      });

      return apiError(
        `Failed to submit to trading server: ${upstreamError || "unknown error"}`,
        502
      );
    }

    const krakenRef = (upstreamData?.krakenRef as string | undefined) || null;
    const dryRunFlag = Boolean(upstreamData?.dryRun ?? dryRun);

    const updated = await prisma.treasuryTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        krakenRef,
        notes: [transfer.notes, upstreamData?.message as string | undefined]
          .filter(Boolean)
          .join(" | "),
      },
    });

    return apiSuccess({
      transfer: {
        id: updated.id,
        status: updated.status,
        amountUsd: updated.amountCents / 100,
        sourceAccount: updated.sourceAccount,
        destinationAccount: updated.destinationAccount,
        method: updated.method,
        krakenRef: updated.krakenRef,
        submittedAt: updated.submittedAt,
        dryRun: dryRunFlag,
      },
      upstream: upstreamData,
    });
  } catch (error) {
    console.error("Error submitting Kraken settlement:", error);
    return apiError("Failed to submit Kraken settlement", 500);
  }
}
