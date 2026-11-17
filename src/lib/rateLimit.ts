import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory fixed-window rate limiter. Counters are per server instance, so
// this is best-effort; use a shared store (e.g. Upstash) for a strict limit.

interface RateLimitWindow {
  limit: number;
  windowMs: number;
}

interface Counter {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000;
const store = new Map<string, Counter>();

const getClientIp = (request: NextRequest): string => {
  const ip =
    (request as NextRequest & { ip?: string }).ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();
  return ip || "unknown";
};

const prune = (now: number) => {
  store.forEach((counter, key) => {
    if (counter.resetAt <= now) store.delete(key);
  });
  // Cap memory use by dropping the oldest entries
  if (store.size > MAX_KEYS) {
    const excess = store.size - MAX_KEYS;
    let removed = 0;
    for (const key of Array.from(store.keys())) {
      if (removed >= excess) break;
      store.delete(key);
      removed++;
    }
  }
};

export const rateLimit = (
  request: NextRequest,
  {
    name,
    windows,
    methods = ["POST"],
  }: { name: string; windows: RateLimitWindow[]; methods?: string[] },
): NextResponse => {
  if (!methods.includes(request.method)) return NextResponse.next();

  const now = Date.now();
  prune(now);

  const ip = getClientIp(request);
  let retryAfterMs = 0;

  for (const { limit, windowMs } of windows) {
    const key = `${name}:${windowMs}:${ip}`;
    let counter = store.get(key);
    if (!counter || counter.resetAt <= now) {
      counter = { count: 0, resetAt: now + windowMs };
      store.set(key, counter);
    }
    counter.count++;
    if (counter.count > limit) {
      retryAfterMs = Math.max(retryAfterMs, counter.resetAt - now);
    }
  }

  if (retryAfterMs > 0) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  return NextResponse.next();
};
