/**
 * Best-effort in-memory rate limiter (token bucket).
 * Serverless instances do not share memory, so this limits each warm instance
 * — enough to stop abuse of write endpoints. Swap for Upstash/Redis if you
 * need a global limit.
 */

interface Bucket {
  tokens: number;
  refilledAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
}

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: RateLimitOptions = {}
): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (now - bucket.refilledAt > windowMs) buckets.delete(k);
    }
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: limit, refilledAt: now };
    buckets.set(key, bucket);
  }

  const refill = ((now - bucket.refilledAt) / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.refilledAt = now;

  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  return true;
}
