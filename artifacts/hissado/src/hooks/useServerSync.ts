/**
 * Handles all server synchronisation concerns for the active session:
 *   1. On mount: pulls the latest user list from the server and merges it into
 *      the local store so invitations made on other devices are visible.
 *   2. While signed in: sends a presence heartbeat every 5 minutes so the
 *      server can cancel pending email reminders for active users.
 *   3. Continuously: re-syncs the user list every 60 seconds as a safety net
 *      for SSE events that may have been missed during a reconnect gap.
 *
 * All operations are best-effort: network failures fall back gracefully to the
 * locally stored state without surfacing errors to the user.
 */

import { useEffect } from "react";
import { fetchUsers, sendHeartbeat } from "@/lib/api";
import type { User } from "@/lib/data";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1_000;  // 5 minutes
const USER_SYNC_INTERVAL_MS = 60 * 1_000;        // 60 seconds

interface Options {
  /** The currently signed-in user, or null when logged out. */
  currentUserId: string | null;
  /** Called with the latest server user list to merge into local state. */
  onUsersSync: (users: User[]) => void;
}

export function useServerSync({ currentUserId, onUsersSync }: Options): void {
  // ── Initial sync on mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers()
      .then(onUsersSync)
      .catch(() => { /* server unreachable — fall back to localStorage */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Presence heartbeat ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    // Send immediately on sign-in.
    sendHeartbeat(currentUserId);

    const interval = setInterval(
      () => sendHeartbeat(currentUserId),
      HEARTBEAT_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [currentUserId]);

  // ── Periodic user re-sync ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers()
        .then(onUsersSync)
        .catch(() => { /* server unreachable — keep current local state */ });
    }, USER_SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
