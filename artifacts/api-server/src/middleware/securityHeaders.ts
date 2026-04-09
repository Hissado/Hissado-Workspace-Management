import type { Request, Response, NextFunction } from "express";

/**
 * Adds a minimal set of security response headers to every API response.
 *
 * These are not a substitute for a full reverse-proxy configuration (Nginx,
 * Cloudflare, etc.) but give meaningful protection for direct-to-Node deployments.
 */
export function securityHeaders() {
  return function securityHeadersMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    // Prevent MIME sniffing (guards against content-type confusion attacks).
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Deny framing entirely — the API has no browser-rendered UI.
    res.setHeader("X-Frame-Options", "DENY");

    // Disable legacy XSS filter (modern browsers ignore it; old ones may cause issues).
    res.setHeader("X-XSS-Protection", "0");

    // Don't send the Referrer header when navigating away from the API.
    res.setHeader("Referrer-Policy", "no-referrer");

    // Prevent browsers from caching API responses by default.
    // Individual routes may override this where caching is intentional.
    res.setHeader("Cache-Control", "no-store");

    next();
  };
}
