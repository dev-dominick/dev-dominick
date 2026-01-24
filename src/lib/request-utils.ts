/**
 * Utility functions for request handling
 */

import { NextRequest } from "next/server";

/**
 * Extract client IP address from NextRequest
 * Handles X-Forwarded-For (proxy), X-Real-IP, and direct IP
 * Safely extracts first IP if multiple are present
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP if multiple are present (client is first)
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback - safer than casting to any
  return "unknown";
}
