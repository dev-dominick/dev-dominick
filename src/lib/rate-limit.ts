/**
 * Rate limiting with Redis support (Upstash) and in-memory fallback
 * 
 * IMPORTANT: In production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * to enable distributed rate limiting across serverless instances.
 * 
 * Without Redis, rate limiting only works within a single instance.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

// Upstash Redis client (lazy-initialized)
let redisClient: {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  ttl: (key: string) => Promise<number>;
} | null = null;

let redisInitialized = false;
let redisAvailable = false;

async function getRedisClient() {
  if (redisInitialized) {
    return redisAvailable ? redisClient : null;
  }
  
  redisInitialized = true;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn(
      '[Rate Limiter] Redis not configured. Using in-memory fallback.\n' +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.'
    );
    return null;
  }
  
  // Simple Upstash REST client
  redisClient = {
    async incr(key: string): Promise<number> {
      const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.result;
    },
    async expire(key: string, seconds: number): Promise<void> {
      await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async get(key: string): Promise<string | null> {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.result;
    },
    async ttl(key: string): Promise<number> {
      const res = await fetch(`${url}/ttl/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.result;
    },
  };
  
  // Test connection
  try {
    await redisClient.get('__rate_limit_test__');
    redisAvailable = true;
    console.log('[Rate Limiter] Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.warn('[Rate Limiter] Redis connection failed, using in-memory fallback:', error);
    redisClient = null;
    return null;
  }
}

class RateLimiter {
  // In-memory fallback store
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly prefix: string;

  constructor(
    windowMs: number = 15 * 60 * 1000,
    maxAttempts: number = 5,
    prefix: string = 'rl'
  ) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.prefix = prefix;

    // Clean up expired entries every minute (in-memory only)
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  /**
   * Check rate limit using Redis if available, fallback to in-memory
   */
  async checkAsync(identifier: string): Promise<RateLimitResult> {
    const redis = await getRedisClient();
    
    if (redis) {
      return this.checkRedis(redis, identifier);
    }
    
    return this.checkMemory(identifier);
  }

  /**
   * Synchronous check (in-memory only) - for backwards compatibility
   */
  check(identifier: string): RateLimitResult {
    return this.checkMemory(identifier);
  }

  private async checkRedis(
    redis: NonNullable<typeof redisClient>,
    identifier: string
  ): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`;
    const windowSeconds = Math.ceil(this.windowMs / 1000);
    
    try {
      const count = await redis.incr(key);
      
      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }
      
      const ttl = await redis.ttl(key);
      const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : this.windowMs);
      
      if (count > this.maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }
      
      return {
        allowed: true,
        remaining: this.maxAttempts - count,
        resetAt,
      };
    } catch (error) {
      console.error('[Rate Limiter] Redis error, falling back to memory:', error);
      return this.checkMemory(identifier);
    }
  }

  private checkMemory(identifier: string): RateLimitResult {
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

  /**
   * Reset rate limit for an identifier
   */
  async resetAsync(identifier: string): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis) {
      const key = `${this.prefix}:${identifier}`;
      try {
        await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
        });
      } catch {
        // Fallback to memory reset
      }
    }
    
    this.limits.delete(identifier);
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
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5, 'login'); // 5 attempts per 15 minutes
export const signupRateLimiter = new RateLimiter(60 * 60 * 1000, 3, 'signup'); // 3 attempts per hour
export const generalRateLimiter = new RateLimiter(60 * 1000, 20, 'general'); // 20 requests per minute
export const passwordResetRateLimiter = new RateLimiter(60 * 60 * 1000, 3, 'pwreset'); // 3 attempts per hour
