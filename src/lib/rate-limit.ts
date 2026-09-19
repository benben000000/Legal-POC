/**
 * Sliding window rate limiter for LegalSuite / Legal Demo
 * 
 * Supports:
 * 1. Distributed rate limiting via Upstash Redis REST API (when configured in env)
 * 2. In-memory sliding window fallback with periodic pruning (default / zero-config)
 */

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store fallback for development and environments without external Redis
const memoryStore = new Map<string, RateLimitEntry>();

// Clean up stale memory records every 5 minutes
const PRUNE_INTERVAL = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneMemoryStore(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL) return;
  lastPrune = now;

  const threshold = now - windowMs;
  for (const [key, entry] of memoryStore.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > threshold);
    if (entry.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface RateLimitOptions {
  limit?: number;      // Maximum allowed requests in window (default: 5)
  windowMs?: number;   // Window length in milliseconds (default: 60,000 = 1 minute)
}

/**
 * Check if an identifier (e.g. IP address or user ID) is within rate limits.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 60_000;
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Try Upstash Redis REST API if credentials are provided
  if (upstashUrl && upstashToken) {
    try {
      const windowSeconds = Math.ceil(windowMs / 1000);
      // Upstash REST API pipeline: INCR then EXPIRE if new
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSeconds],
          ['TTL', key],
        ]),
        // 1.5s timeout so slow external network never hangs our auth API
        signal: AbortSignal.timeout(1500),
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = (results[0]?.result as number) || 1;
        const ttlSeconds = (results[2]?.result as number) || windowSeconds;

        const remaining = Math.max(0, limit - currentCount);
        const success = currentCount <= limit;
        const resetMs = ttlSeconds > 0 ? ttlSeconds * 1000 : windowMs;

        return {
          success,
          limit,
          remaining,
          resetMs,
        };
      }
    } catch (err) {
      // If Upstash times out or fails, fall back transparently to in-memory limiter
      if (process.env.NODE_ENV === 'development') {
        console.warn('[RateLimiter] Upstash Redis call failed, falling back to in-memory:', err);
      }
    }
  }

  // 2. In-memory sliding window fallback
  pruneMemoryStore(windowMs);

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  const threshold = now - windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > threshold);

  if (entry.timestamps.length >= limit) {
    const oldestTimestamp = entry.timestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);

    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  entry.timestamps.push(now);
  const remaining = limit - entry.timestamps.length;
  const resetMs = windowMs;

  return {
    success: true,
    limit,
    remaining,
    resetMs,
  };
}
