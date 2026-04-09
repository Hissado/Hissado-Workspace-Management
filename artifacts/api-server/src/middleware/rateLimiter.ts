import type { Request, Response, NextFunction } from "express";
import { TooManyRequestsError } from "../lib/errors.js";

interface WindowEntry {
  count: number;
  resetAt: number;
}

/**
 * A lightweight in-memory sliding-window rate limiter.
 *
 * Each unique key (derived from client IP by default) is allowed at most
 * `limit` requests per `windowMs` millisecond window. When the window expires
 * the counter resets automatically.
 *
 * This is intentionally simple and process-local. For multi-process or
 * multi-server deployments, replace the Map with a Redis-backed store.
 */
export function rateLimiter(options: {
  /** Time window in ms. Default: 60 000 (1 minute). */
  windowMs?: number;
  /** Maximum requests per window per key. Default: 60. */
  limit?: number;
  /** Derive the rate-limit key from the request. Default: client IP. */
  keyFn?: (req: Request) => string;
}) {
  const windowMs = options.windowMs ?? 60_000;
  const limit = options.limit ?? 60;
  const keyFn = options.keyFn ?? defaultKey;

  const store = new Map<string, WindowEntry>();

  // Periodically clean up expired entries to prevent unbounded memory growth.
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, windowMs);

  // Don't keep Node alive solely for the cleanup interval.
  cleanupInterval.unref?.();

  return function rateLimitMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    const key = keyFn(req);
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > limit) {
      return next(new TooManyRequestsError());
    }

    next();
  };
}

/** Stricter rate limiter preset for authentication endpoints (5 req / 15 min). */
export function authRateLimiter() {
  return rateLimiter({ windowMs: 15 * 60_000, limit: 5 });
}

function defaultKey(req: Request): string {
  // x-forwarded-for is set by reverse proxies; fall back to socket address.
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded?.split(",")[0] ?? req.socket.remoteAddress ?? "unknown");
  return ip.trim();
}
