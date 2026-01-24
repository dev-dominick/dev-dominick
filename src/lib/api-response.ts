/**
 * Standardized API response helpers
 * Ensures consistent response format across all routes
 */

import { NextResponse } from "next/server";

/**
 * Return a successful API response
 */
export function apiSuccess<T = unknown>(data: T, statusCode = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Return an error API response
 */
export function apiError(message: string, statusCode = 500) {
  return NextResponse.json({ error: message }, { status: statusCode });
}

/**
 * Return a validation error response with specific field information
 */
export function apiValidationError(
  field: string,
  message: string,
  statusCode = 400
) {
  return NextResponse.json(
    { error: message, field },
    { status: statusCode }
  );
}

/**
 * Return a rate limit error with retry information
 */
export function apiRateLimitError(
  message: string,
  remaining: number,
  resetAtMs: number
) {
  const retryAfterSeconds = Math.ceil((resetAtMs - Date.now()) / 1000);
  return NextResponse.json(
    {
      error: message,
      remaining,
      resetAtMs,
      retryAfterSeconds,
    },
    { status: 429 }
  );
}
