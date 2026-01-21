/**
 * Form validation utilities
 * Reusable validators for common form fields
 */

import { ValidationError } from "./errors";

export const validators = {
  /**
   * Validate required field
   */
  required: (value: unknown, fieldName: string): void => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      throw new ValidationError(fieldName, "This field is required");
    }
  },

  /**
   * Validate email format
   */
  email: (value: string, fieldName = "Email"): void => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(
        fieldName,
        "Please enter a valid email address"
      );
    }
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number, fieldName: string): void => {
    if (value.length < min) {
      throw new ValidationError(
        fieldName,
        `Must be at least ${min} characters`
      );
    }
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number, fieldName: string): void => {
    if (value.length > max) {
      throw new ValidationError(fieldName, `Must not exceed ${max} characters`);
    }
  },

  /**
   * Validate number is positive
   */
  positive: (value: number, fieldName: string): void => {
    if (value <= 0) {
      throw new ValidationError(fieldName, "Must be a positive number");
    }
  },

  /**
   * Validate number is greater than or equal to minimum
   */
  min: (value: number, min: number, fieldName: string): void => {
    if (value < min) {
      throw new ValidationError(fieldName, `Must be at least ${min}`);
    }
  },

  /**
   * Validate number is less than or equal to maximum
   */
  max: (value: number, max: number, fieldName: string): void => {
    if (value > max) {
      throw new ValidationError(fieldName, `Must not exceed ${max}`);
    }
  },

  /**
   * Validate number is within range
   */
  range: (value: number, min: number, max: number, fieldName: string): void => {
    if (value < min || value > max) {
      throw new ValidationError(fieldName, `Must be between ${min} and ${max}`);
    }
  },

  /**
   * Validate date is in the future
   */
  futureDate: (value: string | Date, fieldName: string): void => {
    const date = new Date(value);
    if (date <= new Date()) {
      throw new ValidationError(fieldName, "Date must be in the future");
    }
  },

  /**
   * Validate date is in the past
   */
  pastDate: (value: string | Date, fieldName: string): void => {
    const date = new Date(value);
    if (date >= new Date()) {
      throw new ValidationError(fieldName, "Date must be in the past");
    }
  },

  /**
   * Validate date range
   */
  dateRange: (
    startDate: string | Date,
    endDate: string | Date,
    fieldName = "Date range"
  ): void => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new ValidationError(
        fieldName,
        "Start date must be before end date"
      );
    }
  },

  /**
   * Validate URL format
   */
  url: (value: string, fieldName = "URL"): void => {
    try {
      new URL(value);
    } catch {
      throw new ValidationError(fieldName, "Please enter a valid URL");
    }
  },

  /**
   * Validate phone number (basic)
   */
  phone: (value: string, fieldName = "Phone"): void => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length < 10) {
      throw new ValidationError(fieldName, "Please enter a valid phone number");
    }
  },

  /**
   * Validate matches pattern (regex)
   */
  pattern: (value: string, pattern: RegExp, fieldName: string): void => {
    if (!pattern.test(value)) {
      throw new ValidationError(fieldName, `Invalid format for ${fieldName}`);
    }
  },

  /**
   * Validate value is one of allowed options
   */
  oneOf: (value: unknown, allowed: unknown[], fieldName: string): void => {
    if (!allowed.includes(value)) {
      throw new ValidationError(
        fieldName,
        `Must be one of: ${allowed.join(", ")}`
      );
    }
  },

  /**
   * Validate two values match (e.g., password confirmation)
   */
  matches: (value: string, compareValue: string, fieldName: string): void => {
    if (value !== compareValue) {
      throw new ValidationError(fieldName, "Values do not match");
    }
  },
};

/**
 * Validation rule for amount fields (positive, reasonable limit)
 */
export function validateAmount(
  value: string | number,
  fieldName = "Amount"
): number {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    throw new ValidationError(fieldName, "Must be a valid number");
  }

  validators.positive(num, fieldName);
  validators.max(num, 999_999_999, fieldName);

  return num;
}

/**
 * Validation rule for currency amount
 */
export function validateCurrency(
  value: string | number,
  fieldName = "Amount"
): number {
  const num = validateAmount(value, fieldName);

  if (!/^\d+(\.\d{1,2})?$/.test(num.toString())) {
    throw new ValidationError(fieldName, "Must have at most 2 decimal places");
  }

  return num;
}

/**
 * Batch validate multiple fields
 */
export function batchValidate(
  fields: Record<string, { value: unknown; validator: (v: unknown) => void }>
): void {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([, { value, validator }]) => {
    try {
      validator(value);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[error.field] = error.message;
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    const message = Object.values(errors).join(", ");
    throw new Error(message);
  }
}
