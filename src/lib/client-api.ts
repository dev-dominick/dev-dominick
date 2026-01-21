// Client-safe API helpers for frontend fetches
export function getApiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_API_URL || null;
}
