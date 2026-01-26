import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import * as ledger from "@/lib/internal-ledger";

/**
 * GET /api/ledger
 * Get full ledger summary (accounts, balances, transactions)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    const summary = ledger.getLedgerSummary();
    return apiSuccess(summary);
  } catch (error) {
    console.error("Ledger GET error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to get ledger",
      500
    );
  }
}

/**
 * POST /api/ledger
 * Record a transaction
 * 
 * Body: { 
 *   action: 'cash_income' | 'owner_draw' | 'capital_contribution' | 'deposit_to_bank' | 'ach_to_kraken' | 'wire_to_kraken' | 'complete_transfer' | 'expense',
 *   amountUsd?: number,
 *   clientName?: string,
 *   note?: string,
 *   transferId?: string (for complete_transfer),
 *   category?: string (for expense - home_office, equipment, software, internet, education, travel, meals, professional, insurance, bank_fees, marketing, other),
 *   vendor?: string (for expense),
 *   paidFrom?: 'cash' | 'bank' (for expense),
 *   receiptRef?: string (for expense)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    const body = await request.json();
    const { action, amountUsd, clientName, note, transferId, reference, category, vendor, paidFrom, receiptRef } = body;

    if (!action) {
      return apiError("action is required", 400);
    }

    // For most actions, amount is required
    if (!['complete_transfer', 'reset'].includes(action) && (!amountUsd || amountUsd <= 0)) {
      return apiError("amountUsd must be positive", 400);
    }

    const amountCents = Math.round((amountUsd || 0) * 100);
    let result: ledger.LedgerEntry | ledger.Transfer | { message: string };

    switch (action) {
      case 'cash_income':
        result = ledger.recordCashIncome(amountCents, clientName, note);
        break;

      case 'owner_draw':
        result = ledger.recordOwnerDraw(amountCents, note);
        break;

      case 'capital_contribution':
        result = ledger.recordCapitalContribution(amountCents, note);
        break;

      case 'deposit_to_bank':
        result = ledger.depositCashToBank(amountCents, note);
        break;

      case 'ach_to_kraken':
        result = ledger.achToKraken(amountCents, note);
        break;

      case 'wire_to_kraken':
        result = ledger.wireToKraken(amountCents, note);
        break;

      case 'expense':
        if (!category) {
          return apiError("category is required for expense", 400);
        }
        result = ledger.recordExpense({
          amountCents,
          category,
          description: note || 'Business expense',
          paidFrom: paidFrom || 'cash',
          vendor,
          receiptRef,
        });
        break;

      case 'complete_transfer':
        if (!transferId) {
          return apiError("transferId is required for complete_transfer", 400);
        }
        result = ledger.completeTransfer(transferId, reference);
        break;

      case 'reset':
        // Dev only - reset ledger
        if (process.env.NODE_ENV !== 'development') {
          return apiError("Reset only available in development", 403);
        }
        ledger.resetLedger();
        result = { message: 'Ledger reset to initial state' };
        break;

      default:
        return apiError(`Unknown action: ${action}`, 400);
    }

    // Return updated summary along with the result
    const summary = ledger.getLedgerSummary();

    return apiSuccess({
      result,
      summary,
    });
  } catch (error) {
    console.error("Ledger POST error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to process transaction",
      500
    );
  }
}
