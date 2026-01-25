import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * TEMPORARY SETUP ENDPOINT - DELETE AFTER USE
 * 
 * POST /api/admin/setup?action=cleanup - Delete all test appointments
 * POST /api/admin/setup?action=promote&email=xxx - Promote user to admin-main
 * POST /api/admin/setup?action=migrate - Push schema (triggers on any DB operation)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");

    // Simple secret check - use a query param for basic protection
    const secret = searchParams.get("secret");
    if (secret !== "temp-setup-2026") {
      return apiError("Unauthorized", 401);
    }

    switch (action) {
      case "cleanup": {
        // Delete all appointments
        const deleted = await prisma.appointment.deleteMany({});
        return apiSuccess({ 
          message: "Appointments deleted", 
          count: deleted.count 
        });
      }

      case "promote": {
        if (!email) {
          return apiError("Email parameter required", 400);
        }

        const user = await prisma.user.update({
          where: { email },
          data: { role: "admin-main" },
        });

        return apiSuccess({ 
          message: "User promoted to admin-main", 
          user: { id: user.id, email: user.email, role: user.role } 
        });
      }

      case "migrate": {
        // Just doing a simple query triggers connection and validates schema
        const userCount = await prisma.user.count();
        const appointmentCount = await prisma.appointment.count();
        
        // Try to access new tables (will fail if migration hasn't run)
        let conversationCount = 0;
        try {
          conversationCount = await prisma.conversation.count();
        } catch {
          return apiError("Conversation table not found - run prisma db push", 500);
        }

        return apiSuccess({ 
          message: "Schema validated", 
          counts: { users: userCount, appointments: appointmentCount, conversations: conversationCount }
        });
      }

      default:
        return apiError("Invalid action. Use: cleanup, promote, or migrate", 400);
    }
  } catch (error) {
    console.error("Setup error:", error);
    return apiError(`Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
