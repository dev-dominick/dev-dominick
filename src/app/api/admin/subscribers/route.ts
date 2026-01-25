import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/admin/subscribers
 * Fetch all newsletter subscribers (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check - admin only
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "admin") {
      return apiError("Unauthorized", 401);
    }

    // Get all subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      select: {
        id: true,
        email: true,
        status: true,
        subscribedAt: true,
        unsubscribedAt: true,
      },
    });

    // Calculate stats
    const stats = {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === "active").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    };

    return apiSuccess({ subscribers, stats });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return apiError("Failed to fetch subscribers", 500);
  }
}

/**
 * DELETE /api/admin/subscribers?id=xxx
 * Delete a subscriber (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Auth check - admin only
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "admin") {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Missing subscriber id", 400);
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return apiError("Failed to delete subscriber", 500);
  }
}

/**
 * PATCH /api/admin/subscribers
 * Update subscriber status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Auth check - admin only
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "admin") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return apiError("Missing required fields", 400);
    }

    const validStatuses = ["active", "unsubscribed", "bounced"];
    if (!validStatuses.includes(status)) {
      return apiError("Invalid status", 400);
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "unsubscribed") {
      updateData.unsubscribedAt = new Date();
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess({ subscriber: updated });
  } catch (error) {
    console.error("Error updating subscriber:", error);
    return apiError("Failed to update subscriber", 500);
  }
}
