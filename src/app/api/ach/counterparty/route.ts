import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import * as column from "@/lib/column";

/**
 * POST /api/ach/counterparty
 * Create a counterparty (external bank account) for ACH transfers
 * 
 * Body: { 
 *   routingNumber: string,
 *   accountNumber: string,
 *   accountType: 'checking' | 'savings',
 *   name: string,
 *   description?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError("Admin access required", 401);
    }

    if (!column.isConfigured()) {
      return apiError("ACH not configured. Set COLUMN_API_KEY.", 503);
    }

    const body = await request.json();
    const { routingNumber, accountNumber, accountType, name, description } = body;

    // Validate
    if (!routingNumber || !/^\d{9}$/.test(routingNumber)) {
      return apiError("Invalid routing number (must be 9 digits)", 400);
    }
    if (!accountNumber || accountNumber.length < 4) {
      return apiError("Invalid account number", 400);
    }
    if (!accountType || !['checking', 'savings'].includes(accountType)) {
      return apiError("accountType must be 'checking' or 'savings'", 400);
    }
    if (!name) {
      return apiError("name is required", 400);
    }

    // Dev mode mock
    if (process.env.NODE_ENV === "development" && request.cookies.get("dev_admin_mode")?.value === "true") {
      return apiSuccess({
        counterparty: {
          id: `dev-cp-${Date.now()}`,
          routing_number: routingNumber,
          account_number: accountNumber.slice(-4).padStart(accountNumber.length, '*'),
          account_type: accountType,
          name,
          description,
          created_at: new Date().toISOString(),
        },
        message: 'Simulated counterparty (dev mode)',
      });
    }

    const counterparty = await column.createCounterparty({
      routing_number: routingNumber,
      account_number: accountNumber,
      account_type: accountType,
      name,
      description,
    });

    return apiSuccess({ counterparty });
  } catch (error) {
    console.error("Create counterparty error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to create counterparty",
      500
    );
  }
}

/**
 * GET /api/ach/counterparty
 * List all counterparties
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

    // Dev mode mock
    if (process.env.NODE_ENV === "development" && request.cookies.get("dev_admin_mode")?.value === "true") {
      return apiSuccess({
        counterparties: [
          {
            id: 'dev-cp-kraken',
            routing_number: column.ROUTING_NUMBERS.WELLS_FARGO_CA,
            account_number: '****1234',
            account_type: 'checking',
            name: 'Kraken (Payward Inc)',
            description: 'Crypto exchange funding',
            created_at: new Date().toISOString(),
          },
          {
            id: 'dev-cp-personal',
            routing_number: column.ROUTING_NUMBERS.FULTON_BANK,
            account_number: '****5678',
            account_type: 'checking',
            name: 'Personal Checking',
            description: 'Owner draw destination',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }

    const counterparties = await column.listCounterparties();
    return apiSuccess({ counterparties });
  } catch (error) {
    console.error("List counterparties error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to list counterparties",
      500
    );
  }
}
