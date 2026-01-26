import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Dev-mode auth bypass helper
 * In development, if dev_admin_mode cookie is set, returns a mock admin token
 * Otherwise, returns the real NextAuth token
 */
export async function getTokenWithDevBypass(request: NextRequest) {
  // Check for dev bypass cookie
  if (process.env.NODE_ENV === "development") {
    const devAdminCookie = request.cookies.get("dev_admin_mode")?.value;
    if (devAdminCookie === "true") {
      // Return mock admin token for dev mode
      return {
        sub: "dev-admin",
        email: "dev@admin.local",
        role: "admin-main",
        name: "Dev Admin",
      };
    }
  }

  // Normal NextAuth token retrieval
  return await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}
