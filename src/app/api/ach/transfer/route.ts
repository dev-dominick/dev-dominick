import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import * as column from "@/lib/column";

/**
 * POST /api/ach/transfer
 * Initiate an ACH transfer via Column
 * 
 * Body: { 
 *   amount: number (in dollars),
 *   type: 'credit' | 'debit',
 *   counterpartyId: string,
 *   description?: string,
 *   sameDay?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    // Check if Column is configured
    if (!column.isConfigured()) {
      return apiError(
        "ACH transfers not configured. Set COLUMN_API_KEY in environment.", 
        503
      );
    }

    const body = await request.json();
    const { amount, type, counterpartyId, bankAccountId, description, sameDay } = body;

    // Validate
    if (!amount || amount <= 0) {
      return apiError("Amount must be positive", 400);
    }
    if (!type || !['credit', 'debit'].includes(type)) {
      return apiError("Type must be 'credit' or 'debit'", 400);
    }
    if (!counterpartyId) {
      return apiError("counterpartyId is required", 400);
    }
    if (!bankAccountId) {
      return apiError("bankAccountId is required", 400);
    }

    // Convert dollars to cents
    const amountCents = Math.round(amount * 100);

    // Dev mode: simulate
    if (process.env.NODE_ENV === "development" && request.cookies.get("dev_admin_mode")?.value === "true") {
      return apiSuccess({
        transfer: {
          id: `dev-ach-${Date.now()}`,
          amount: amountCents,
          currency: 'USD',
          type,
          status: 'pending',
          counterparty_id: counterpartyId,
          bank_account_id: bankAccountId,
          description,
          created_at: new Date().toISOString(),
        },
        environment: 'development',
        message: 'Simulated ACH transfer (dev mode)',
      });
    }

    // Create the ACH transfer
    const transfer = await column.createACHTransfer({
      amount: amountCents,
      type,
      counterparty_id: counterpartyId,
      bank_account_id: bankAccountId,
      description,
      same_day: sameDay,
    });

    return apiSuccess({
      transfer,
      environment: column.getEnvironment(),
    });
  } catch (error) {
    console.error("ACH transfer error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to initiate ACH transfer",
      500
    );
  }
}

/**
 * GET /api/ach/transfer?id=xxx
 * Get ACH transfer status
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    if (!column.isConfigured()) {
      return apiError("ACH not configured", 503);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Dev mode mock
    if (process.env.NODE_ENV === "development" && request.cookies.get("dev_admin_mode")?.value === "true") {
      if (id) {
        return apiSuccess({
          transfer: {
            id,
            amount: 100000,
            currency: 'USD',
            type: 'credit',
            status: 'completed',
            counterparty_id: 'dev-cp-1',
            bank_account_id: 'dev-ba-1',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          },
        });
      }
      return apiSuccess({
        transfers: [
          {
            id: 'dev-ach-1',
            amount: 100000,
            currency: 'USD',
            type: 'credit',
            status: 'completed',
            counterparty_id: 'dev-cp-1',
            bank_account_id: 'dev-ba-1',
            description: 'Fund Kraken',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }

    if (id) {
      const transfer = await column.getACHTransfer(id);
      return apiSuccess({ transfer });
    }

    const transfers = await column.listACHTransfers({ limit: 50 });
    return apiSuccess({ transfers });
  } catch (error) {
    console.error("ACH fetch error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch ACH transfers",
      500
    );
  }
}
