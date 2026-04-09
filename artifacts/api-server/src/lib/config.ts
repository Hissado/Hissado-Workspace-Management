/**
 * Centralised server configuration with fail-fast environment validation.
 *
 * All environment variables consumed by the server are read exactly once here.
 * If a required variable is absent the process exits immediately with a clear
 * diagnostic message rather than failing silently later at request time.
 *
 * Import this module wherever config values are needed — never read
 * `process.env` directly in other modules.
 */

import { logger } from "./logger.js";

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function parsePort(raw: string | undefined, name: string): number {
  if (!raw) {
    logger.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    logger.error(`Invalid ${name} value: "${raw}" — must be an integer between 1 and 65535`);
    process.exit(1);
  }
  return port;
}

// ── Parsed, validated configuration ──────────────────────────────────────────

export const config = {
  /** HTTP port the Express server listens on. */
  port: parsePort(process.env["PORT"], "PORT"),

  /** Node environment — controls logging format and other dev/prod switches. */
  env: optionalEnv("NODE_ENV", "development") as "development" | "production" | "test",

  /** PostgreSQL connection string (required when database features are enabled). */
  databaseUrl: process.env["DATABASE_URL"],

  /**
   * Comma-separated list of allowed CORS origins.
   * Defaults to wildcard in development; must be set explicitly in production.
   *
   * Example:
   *   CORS_ORIGINS=https://app.hissadoconsulting.com,https://client.hissadoconsulting.com
   */
  corsOrigins: parseCorsOrigins(),

  /** Public-facing app URL used in email links. */
  appUrl: optionalEnv("APP_URL", "https://client.hissadoconsulting.com"),

  /** Log level passed to Pino. */
  logLevel: optionalEnv("LOG_LEVEL", "info"),
} as const;

export const isProduction = config.env === "production";
export const isDevelopment = config.env === "development";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCorsOrigins(): string[] | "*" {
  const raw = process.env["CORS_ORIGINS"];
  if (!raw) {
    // Default: open in development, locked-down in production.
    return process.env["NODE_ENV"] === "production" ? [] : "*";
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
