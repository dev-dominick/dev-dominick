/**
 * Centralized error handling utilities
 * Consistent error messages and handling across the app
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Extract human-readable error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Response) {
    return `Error ${error.status}: ${error.statusText}`;
  }

  if (error instanceof ValidationError) {
    return `${error.field}: ${error.message}`;
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("detail" in error && typeof error.detail === "string") {
      return error.detail;
    }
  }

  return "An unknown error occurred";
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("failed to fetch")
    );
  }
  return false;
}

/**
 * Check if error is timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || error.message.includes("timeout");
  }
  return false;
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError;
}

/**
 * Check if error is API error with specific status
 */
export function isApiError(error: unknown, status?: number): boolean {
  if (error instanceof ApiError) {
    return status ? error.status === status : true;
  }
  return false;
}

/**
 * Friendly error messages for common scenarios
 */
export const errorMessages = {
  network:
    "Unable to connect to server. Please check your internet connection.",
  timeout: "Request timed out. Please try again.",
  notFound: "The requested resource was not found.",
  unauthorized: "You are not authorized to perform this action.",
  forbidden: "Access denied.",
  conflict: "This resource already exists.",
  validation: "Please check your input and try again.",
  server: "Server error. Please try again later.",
  unknown: "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message based on status code
 */
export function getStatusErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: errorMessages.validation,
    401: errorMessages.unauthorized,
    403: errorMessages.forbidden,
    404: errorMessages.notFound,
    409: errorMessages.conflict,
    500: errorMessages.server,
    502: errorMessages.server,
    503: errorMessages.server,
    504: errorMessages.timeout,
  };

  return messages[status] || errorMessages.unknown;
}

/**
 * Format validation error for display
 */
export function formatValidationErrors(
  errors: Record<string, string[]> | Record<string, string>
): string[] {
  return Object.entries(errors).flatMap(([field, messages]) => {
    if (Array.isArray(messages)) {
      return messages.map((msg) => `${field}: ${msg}`);
    }
    return `${field}: ${messages}`;
  });
}
