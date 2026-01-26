import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { validateAmount } from "@/lib/validators";

const VALID_METHODS = ["CASH", "ACH", "WIRE", "CHECK", "OTHER", "OWNER_DRAW", "CAPITAL_CONTRIBUTION", "INTERNAL_TRANSFER"];
const MIN_AMOUNT = 1; // $1 minimum
const MAX_AMOUNT = 1000000; // $1M maximum

/**
 * POST /api/payments/manual
 * Record a manual payment receipt (cash, ACH, wire, check)
 * 
 * Admin only - records that a payment was RECEIVED
 * Body: { amountUsd, method, clientName?, clientEmail?, description?, notes?, externalRef? }
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication (supports dev bypass)
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    const userId = admin.sub as string;
    const body = await request.json();
    
    const {
      amountUsd,
      method,
      clientName,
      clientEmail,
      description,
      notes,
      externalRef,
    } = body;

    // Validate required fields
    if (!amountUsd) {
      return apiError("Amount is required", 400);
    }

    if (!method) {
      return apiError("Payment method is required", 400);
    }

    // Validate method
    const upperMethod = method.toUpperCase();
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

    if (validatedAmount < MIN_AMOUNT) {
      return apiError(`Minimum amount is $${MIN_AMOUNT}`, 400);
    }
    if (validatedAmount > MAX_AMOUNT) {
      return apiError(`Maximum amount is $${MAX_AMOUNT.toLocaleString()}`, 400);
    }

    const amountCents = Math.round(validatedAmount * 100);

    // Dev fallback: return mock receipt without DB when dev toggle is set
    if (process.env.NODE_ENV === "development" && request.cookies.get("dev_admin_mode")?.value === "true") {
      const now = new Date();
      return apiSuccess({
        receipt: {
          id: "dev-r-new",
          method: upperMethod,
          amountUsd: amountCents / 100,
          amountCents,
          status: "RECEIVED",
          receivedAt: now.toISOString(),
          clientName: clientName || null,
          description: description || `${upperMethod} payment - $${validatedAmount.toFixed(2)}`,
        },
      }, 201);
    }

    // Create payment receipt as RECEIVED (manual payments are recorded after receipt)
    const receipt = await prisma.paymentReceipt.create({
      data: {
        userId,
        method: upperMethod,
        amountCents,
        currency: "USD",
        status: "RECEIVED",
        receivedAt: new Date(),
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        description: description || `${upperMethod} payment - $${validatedAmount.toFixed(2)}`,
        notes: notes || null,
        externalRef: externalRef || null,
      },
    });

    console.log(`[PAYMENT] Manual ${upperMethod} receipt created: $${validatedAmount.toFixed(2)} by admin ${admin.email}`);

    return apiSuccess({
      receipt: {
        id: receipt.id,
        method: receipt.method,
        amountUsd: receipt.amountCents / 100,
        amountCents: receipt.amountCents,
        status: receipt.status,
        receivedAt: receipt.receivedAt,
        clientName: receipt.clientName,
        description: receipt.description,
      },
    }, 201);
  } catch (error) {
    console.error("Error creating manual payment:", error);
    return apiError("Failed to create payment receipt", 500);
  }
}
