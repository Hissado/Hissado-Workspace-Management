/**
 * Typed HTTP error hierarchy for consistent error handling across all routes.
 *
 * Usage:
 *   throw new BadRequestError("Email is required");
 *   throw new NotFoundError("User not found");
 *   throw new ConflictError("Email already in use");
 *
 * The global error handler in app.ts automatically maps these to the correct
 * HTTP status codes and a uniform JSON response shape: { error: string }.
 */

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Restore correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication required") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Access denied") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string) {
    super(422, message);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too many requests — please slow down") {
    super(429, message);
  }
}

export class InternalError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, message);
  }
}
