import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

const VALID_STATUSES = ["PLANNED", "SUBMITTED", "CONFIRMED", "CANCELED"];
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["SUBMITTED", "CANCELED"],
  SUBMITTED: ["CONFIRMED", "CANCELED"],
  CONFIRMED: [], // Terminal state
  CANCELED: [], // Terminal state
};

/**
 * PATCH /api/treasury/transfers/[id]
 * Update transfer status and references
 * 
 * Body: { status?, bankRef?, krakenRef?, notes? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find existing transfer
    const existing = await prisma.treasuryTransfer.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Transfer not found", 404);
    }

    const body = await request.json();
    const { status, bankRef, krakenRef, notes } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Handle status transition
    if (status) {
      const upperStatus = status.toUpperCase();
      
      if (!VALID_STATUSES.includes(upperStatus)) {
        return apiError(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`, 400);
      }

      const allowedTransitions = STATUS_TRANSITIONS[existing.status];
      if (!allowedTransitions.includes(upperStatus)) {
        return apiError(
          `Cannot transition from ${existing.status} to ${upperStatus}. Allowed: ${allowedTransitions.join(", ") || "none"}`,
          400
        );
      }

      updateData.status = upperStatus;

      // Set timestamps based on status
      if (upperStatus === "SUBMITTED") {
        updateData.submittedAt = new Date();
      } else if (upperStatus === "CONFIRMED") {
        updateData.confirmedAt = new Date();
      }
    }

    // Update references
    if (bankRef !== undefined) {
      updateData.bankRef = bankRef;
    }
    if (krakenRef !== undefined) {
      updateData.krakenRef = krakenRef;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("No fields to update", 400);
    }

    const updated = await prisma.treasuryTransfer.update({
      where: { id },
      data: updateData,
    });

    console.log(`[TREASURY] Transfer ${id} updated: ${existing.status} -> ${updated.status}`);

    return apiSuccess({
      transfer: {
        id: updated.id,
        sourceAccount: updated.sourceAccount,
        destinationAccount: updated.destinationAccount,
        method: updated.method,
        amountUsd: updated.amountCents / 100,
        status: updated.status,
        plannedAt: updated.plannedAt,
        submittedAt: updated.submittedAt,
        confirmedAt: updated.confirmedAt,
        bankRef: updated.bankRef,
        krakenRef: updated.krakenRef,
        notes: updated.notes,
      },
    });
  } catch (error) {
    console.error("Error updating transfer:", error);
    return apiError("Failed to update transfer", 500);
  }
}

/**
 * GET /api/treasury/transfers/[id]
 * Get a specific transfer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const transfer = await prisma.treasuryTransfer.findUnique({
      where: { id },
      include: {
        paymentReceipt: true,
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!transfer) {
      return apiError("Transfer not found", 404);
    }

    return apiSuccess({
      transfer: {
        ...transfer,
        amountUsd: transfer.amountCents / 100,
      },
    });
  } catch (error) {
    console.error("Error fetching transfer:", error);
    return apiError("Failed to fetch transfer", 500);
  }
}
