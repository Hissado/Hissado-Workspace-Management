import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { config } from "./lib/config.js";
import { HttpError } from "./lib/errors.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app: Express = express();

// ── Security headers (applied to every response) ─────────────────────────────
app.use(securityHeaders());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigins === "*" ? true : config.corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Request logging ───────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Body parsing — with an explicit size limit to prevent oversized payloads ──
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Global rate limiter (100 req / min per IP) ────────────────────────────────
// Individual routes may add stricter limits on top of this.
app.use(rateLimiter({ windowMs: 60_000, limit: 100 }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── 404 catch-all (must come after all routes) ────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
//
// Handles both intentional HttpError throws (from routes and middleware) and
// unexpected errors. All errors are logged; only internal errors suppress the
// original message in the response (to avoid leaking implementation details).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    // Known, intentional errors — log at warn level for 4xx, error for 5xx.
    if (err.statusCode >= 500) {
      logger.error({ err, statusCode: err.statusCode }, err.message);
    } else {
      logger.warn({ statusCode: err.statusCode }, err.message);
    }
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unknown errors — always log in full, never expose internals to the client.
  logger.error(err, "Unhandled error");
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
