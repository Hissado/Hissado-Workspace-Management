// Centralized API service layer for all communication with the Express backend.
// All fetch() calls in the application should go through this module.
import type { User } from "./data";

const BASE = "/api";

// ── Users ─────────────────────────────────────────────────────────────────────

/** Fetches the full list of users from the server (used for cross-device sync). */
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error(`GET /users failed: ${res.status}`);
  return res.json();
}

/** Creates a new user on the server so credentials are available across all browsers. */
export async function createUser(user: User): Promise<void> {
  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `POST /users failed: ${res.status}`);
  }
}

/** Persists a password update for a user to the server (used after a forced password change). */
export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, mustChangePassword: false }),
  });
  if (!res.ok) throw new Error(`PUT /users/${userId} failed: ${res.status}`);
}

// ── Heartbeat ─────────────────────────────────────────────────────────────────

/** Sends a presence heartbeat so the server can track online status. */
export async function sendHeartbeat(userId: string): Promise<void> {
  await fetch(`${BASE}/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).catch(() => {
    // Heartbeats are best-effort; suppress network errors silently.
  });
}

// ── Push notification reminders ───────────────────────────────────────────────

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

/** Registers a pending email reminder with the server (best-effort; non-fatal if it fails). */
export async function registerReminder(payload: ReminderPayload): Promise<void> {
  const res = await fetch(`${BASE}/reminders/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /reminders/register failed: ${res.status}`);
}

// ── Invitations ───────────────────────────────────────────────────────────────

interface InvitePayload {
  name: string;
  email: string;
  role: string;
  tempPassword: string;
  invitedBy: string;
  workspaceName?: string;
  lang?: string;
}

interface InviteResult {
  success: boolean;
  emailId?: string;
  error?: string;
  details?: string;
}

/** Sends a workspace invitation email. */
export async function sendInviteEmail(payload: InvitePayload): Promise<InviteResult> {
  const res = await fetch(`${BASE}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
