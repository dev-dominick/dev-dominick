import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClientIp } from "@/lib/request-utils";

// Allowed IPs for setup endpoint (add your IPs here)
const ALLOWED_IPS = process.env.ADMIN_SETUP_ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];

/**
 * ADMIN SETUP ENDPOINT - SECURED
 * 
 * Requires:
 * 1. ADMIN_SETUP_SECRET environment variable
 * 2. Admin authentication OR IP whitelist
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
    const secret = searchParams.get("secret");

    // SECURITY: Require env-based secret (fail-closed)
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret) {
      console.error("ADMIN_SETUP_SECRET not configured - endpoint disabled");
      return apiError("Setup endpoint disabled", 503);
    }

    if (secret !== setupSecret) {
      return apiError("Unauthorized", 401);
    }

    // Additional security layer: require admin auth OR whitelisted IP
    const clientIp = getClientIp(request);
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAdmin = token && (token.role === "admin" || token.role === "admin-main");
    const isWhitelistedIp = ALLOWED_IPS.length > 0 && ALLOWED_IPS.includes(clientIp);
    
    if (!isAdmin && !isWhitelistedIp) {
      console.warn(`Setup endpoint access denied for IP: ${clientIp}`);
      return apiError("Unauthorized - admin access or whitelisted IP required", 403);
    }

    // Log all setup actions for audit trail
    console.log(`[ADMIN SETUP] Action: ${action}, IP: ${clientIp}, User: ${token?.email || "none"}`);

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
    return apiError("Setup failed", 500);
  }
}
