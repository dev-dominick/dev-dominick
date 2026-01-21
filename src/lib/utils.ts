/**
 * Lightweight utility functions
 */

export const formatters = {
  currency: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  },

  date: (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  },

  number: (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  },

  percent: (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  },
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
