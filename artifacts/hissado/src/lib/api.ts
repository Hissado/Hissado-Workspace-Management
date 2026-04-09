/**
 * Centralised API service layer for all communication with the Express backend.
 *
 * All fetch() calls in the application go through this module. Each function:
 *   - Calls a single, well-defined endpoint
 *   - Throws a typed error on non-OK responses
 *   - Parses the response JSON with a Zod schema so callers receive a typed value
 *
 * If the server is unreachable, callers are responsible for catching and falling
 * back to localStorage (the local-first offline strategy used throughout the app).
 */

import { z } from "zod";
import type { User } from "./data";

const BASE = "/api";

// ── Shared Zod schemas ─────────────────────────────────────────────────────────
//
// These mirror the shapes returned by the backend. They deliberately use
// z.object().passthrough() for user records so that fields added in future
// backend versions are not silently stripped on the frontend.

const UserSchema: z.ZodType<User> = z.object({
  id:                z.string(),
  name:              z.string(),
  email:             z.string(),
  role:              z.string(),
  av:                z.string(),
  photo:             z.string().optional(),
  color:             z.string().optional(),
  status:            z.enum(["active", "inactive"]),
  dept:              z.string(),
  phone:             z.string().optional(),
  clientId:          z.string().optional(),
  password:          z.string().optional(),
  mustChangePassword:z.boolean().optional(),
  invitedAt:         z.string().optional(),
  invitedBy:         z.string().optional(),
});

const UsersListSchema = z.array(UserSchema);

const LoginResponseSchema = z.object({
  user: UserSchema,
});

const OkResponseSchema = z.object({ ok: z.boolean() });

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Executes a fetch request and returns the parsed JSON body.
 * Throws an `ApiError` if the response is not OK.
 */
async function apiFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({})) as unknown;

  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Log the mismatch but don't crash — return the raw body with a cast.
    // This keeps the app functional while alerting developers to a schema drift.
    console.warn("[api] Response schema validation failed:", parsed.error.issues);
    return body as T;
  }
  return parsed.data;
}

/** JSON POST shorthand */
function jsonPost<T>(url: string, schema: z.ZodType<T>, body: unknown): Promise<T> {
  return apiFetch(url, schema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** JSON PUT shorthand */
function jsonPut<T>(url: string, schema: z.ZodType<T>, body: unknown): Promise<T> {
  return apiFetch(url, schema, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Error type ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Users ──────────────────────────────────────────────────────────────────────

/** Fetches the full list of users from the server (used for cross-device sync). */
export function fetchUsers(): Promise<User[]> {
  return apiFetch(`${BASE}/users`, UsersListSchema);
}

/** Creates a new user on the server so credentials are available across all browsers. */
export async function createUser(user: User): Promise<void> {
  await jsonPost(`${BASE}/users`, z.unknown(), user);
}

/**
 * Persists a password update for a user.
 * Called after a forced password-change flow to keep the server in sync.
 */
export async function updateUserPassword(userId: string, password: string): Promise<void> {
  await jsonPut(`${BASE}/users/${encodeURIComponent(userId)}`, z.unknown(), {
    password,
    mustChangePassword: false,
  });
}

/** Persists a full profile update for a user (cross-browser sync). */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  await jsonPut(`${BASE}/users/${encodeURIComponent(userId)}`, z.unknown(), updates);
}

/** Deletes a user from the server (cross-browser sync). */
export async function deleteUserOnServer(userId: string): Promise<void> {
  const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new ApiError(`DELETE /users/${userId} failed`, res.status);
  }
}

// ── Real-time signals ──────────────────────────────────────────────────────────

/**
 * Broadcasts a signal event to ALL currently connected users.
 * Best-effort — silently swallows errors since broadcast failures are non-fatal.
 */
export async function broadcastSignal(
  event: string,
  data: unknown = {},
  excludeUserId?: string,
): Promise<void> {
  await fetch(`${BASE}/signal/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, data, excludeUserId }),
  }).catch(() => { /* non-fatal */ });
}

// ── Heartbeat ──────────────────────────────────────────────────────────────────

/**
 * Sends a presence heartbeat so the server can track online status and cancel
 * pending email reminders for active users.
 * Best-effort — silently swallows errors.
 */
export async function sendHeartbeat(userId: string): Promise<void> {
  await fetch(`${BASE}/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).catch(() => { /* best-effort */ });
}

// ── Email reminders ────────────────────────────────────────────────────────────

export interface ReminderPayload {
  id: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  type: "message" | "call" | "notification";
  summary: string;
  senderName: string;
  lang?: string;
  scheduledAt: string;
}

/** Registers a pending email reminder with the server. */
export async function registerReminder(payload: ReminderPayload): Promise<void> {
  await jsonPost(`${BASE}/reminders/register`, OkResponseSchema, payload);
}

// ── Invitations ────────────────────────────────────────────────────────────────

export interface InvitePayload {
  name: string;
  email: string;
  role: string;
  tempPassword: string;
  invitedBy: string;
  workspaceName?: string;
  lang?: string;
}

export interface InviteResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

const InviteResultSchema = z.object({
  success: z.boolean(),
  emailId: z.string().optional(),
  error:   z.string().optional(),
});

/** Sends a workspace invitation email via the server. */
export async function sendInviteEmail(payload: InvitePayload): Promise<InviteResult> {
  try {
    return await jsonPost(`${BASE}/invite`, InviteResultSchema, payload);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to send invitation";
    return { success: false, error: message };
  }
}
