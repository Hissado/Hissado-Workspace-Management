import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../lib/errors.js";

/**
 * Returns an Express middleware that validates `req.body` against a Zod schema.
 * On failure it throws a `BadRequestError` with the first validation message,
 * which the global error handler maps to HTTP 400.
 *
 * Usage:
 *   router.post("/users", validate(CreateUserSchema), handler);
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = formatZodError(result.error);
      return next(new BadRequestError(first));
    }
    // Replace req.body with the parsed (and coerced) value so downstream
    // handlers receive a correctly-typed object without re-parsing.
    req.body = result.data;
    next();
  };
}

/**
 * Returns an Express middleware that validates `req.query` against a Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const first = formatZodError(result.error);
      return next(new BadRequestError(first));
    }
    // Cast is safe — Zod coerced values replace raw query strings.
    (req as unknown as { query: T }).query = result.data;
    next();
  };
}

function formatZodError(err: ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid request body";
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}
