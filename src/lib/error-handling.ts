/**
 * Premium error handling utilities for enterprise-grade UX
 * Provides user-friendly messages and retry logic
 */

import { ToastMessage } from '@/components/ui/toast';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorContext {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  originalMessage?: string;
  requestId?: string;
}

/**
 * Map HTTP status codes and API errors to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<number | string, string> = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // 4xx errors
  400: 'There was a problem with your request. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The resource you are looking for was not found.',
  409: 'This resource already exists. Please choose a different value.',
  422: 'Your input validation failed. Please check the highlighted fields.',
  429: 'Too many requests. Please wait a moment before trying again.',
  
  // 5xx errors
  500: 'Server error. Our team has been notified. Please try again later.',
  502: 'Gateway error. Please try again in a moment.',
  503: 'Service temporarily unavailable. Please try again shortly.',
  504: 'Request timeout. Please try again.',
};

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(
  error: unknown,
  context?: ErrorContext
): string {
  if (error instanceof APIError) {
    return ERROR_MESSAGE_MAP[error.status] || error.message;
  }

  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGE_MAP.NETWORK_ERROR;
    }
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return ERROR_MESSAGE_MAP.TIMEOUT_ERROR;
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return ERROR_MESSAGE_MAP[error] || error;
  }

  return ERROR_MESSAGE_MAP[500];
}

/**
 * Parse API error response
 */
export async function parseAPIError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || ERROR_MESSAGE_MAP[response.status];
  } catch {
    return ERROR_MESSAGE_MAP[response.status] || ERROR_MESSAGE_MAP[500];
  }
}

/**
 * Create a toast message from an error
 */
export function createErrorToast(
  error: unknown,
  context?: ErrorContext
): Omit<ToastMessage, 'id'> {
  const message = getUserFriendlyMessage(error, context);

  return {
    type: 'error',
    title: 'Something went wrong',
    message,
    duration: 5000,
  };
}

/**
 * Create a toast message with retry action
 */
export function createErrorToastWithRetry(
  error: unknown,
  onRetry: () => void,
  context?: ErrorContext
): Omit<ToastMessage, 'id'> {
  const message = getUserFriendlyMessage(error, context);

  return {
    type: 'error',
    title: 'Something went wrong',
    message,
    action: {
      label: 'Retry',
      onClick: onRetry,
    },
    duration: 0, // Keep open until dismissed
  };
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch')
    );
  }
  return false;
}

/**
 * Check if error is timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.message.includes('timeout');
  }
  return false;
}

/**
 * Extract validation errors from API response
 */
export function extractValidationErrors(
  data: unknown
): Record<string, string> {
  if (!data || typeof data !== 'object') return {};

  const errors: Record<string, string> = {};

  if ('errors' in data && typeof data.errors === 'object' && data.errors !== null) {
    Object.entries(data.errors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        errors[key] = value;
      } else if (Array.isArray(value)) {
        errors[key] = value[0]?.toString() || 'Invalid input';
      }
    });
  }

  return errors;
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        onRetry?.(attempt + 1, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
