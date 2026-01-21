/**
 * Centralized data formatting utilities
 * Consistent date, currency, and value formatting across the app
 */

export const formatters = {
  /**
   * Format number as currency
   * @example formatters.currency(1234.56) // "$1,234.56"
   */
  currency: (amount: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format date as short date string
   * @example formatters.date("2026-01-14") // "Jan 14, 2026"
   */
  date: (date: string | Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Format date and time
   * @example formatters.datetime("2026-01-14T10:30:00") // "Jan 14, 2026, 10:30 AM"
   */
  datetime: (date: string | Date): string => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  },

  /**
   * Format percentage
   * @example formatters.percent(0.856) // "85.6%"
   */
  percent: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format time relative to now (e.g., "2 hours ago")
   * @example formatters.timeago("2026-01-14T08:00:00") // "2h ago"
   */
  timeago: (date: string | Date): string => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 0) return "in the future";
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return formatters.date(date);
  },

  /**
   * Format time duration in human readable format
   * @example formatters.duration(3661) // "1h 1m 1s"
   */
  duration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  },

  /**
   * Format number with commas
   * @example formatters.number(1234567) // "1,234,567"
   */
  number: (value: number, decimals = 0): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Truncate string with ellipsis
   * @example formatters.truncate("Long text here", 10) // "Long tex..."
   */
  truncate: (text: string, length: number, suffix = "..."): string => {
    if (text.length <= length) return text;
    return text.slice(0, length - suffix.length) + suffix;
  },

  /**
   * Format bytes as human readable size
   * @example formatters.bytes(1024) // "1 KB"
   */
  bytes: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  },

  /**
   * Format phone number
   * @example formatters.phone("1234567890") // "(123) 456-7890"
   */
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) return phone;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  },

  /**
   * Format email (mask for privacy)
   * @example formatters.maskEmail("john@example.com") // "j***@example.com"
   */
  maskEmail: (email: string): string => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    return local[0] + "*".repeat(Math.max(1, local.length - 2)) + "@" + domain;
  },
};
