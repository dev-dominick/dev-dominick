// Simple in-memory rate limiter
// In production, replace with Redis-backed solution

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or expired
    if (!entry || entry.resetAt < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.limits.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetAt: newEntry.resetAt,
      };
    }

    // Entry exists and is valid
    if (entry.count >= this.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetAt < now) {
        this.limits.delete(key);
      }
    }
  }
}

// Create singleton instances for different use cases
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const signupRateLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 attempts per hour
export const generalRateLimiter = new RateLimiter(60 * 1000, 20); // 20 requests per minute
