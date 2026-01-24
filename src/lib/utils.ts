/**
 * Lightweight utility functions
 */

// See src/lib/formatters.ts for formatting utilities
// This avoids duplication of formatters across multiple files

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
