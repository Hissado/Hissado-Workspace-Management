/**
 * File-based user persistence layer.
 *
 * All reads and writes go through this module. Writes are atomic: data is
 * written to a temporary file first, then renamed into place, so a crash
 * mid-write never leaves a corrupt file.
 *
 * NOTE: This is a single-process, file-backed store suitable for the current
 * small-scale deployment. When the user base grows, replace this with the
 * Drizzle ORM + PostgreSQL layer already scaffolded in `/lib/db`.
 */

import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  /** Stored as a scrypt hash ("scrypt:<salt>:<hash>") or legacy plain-text. */
  password: string;
  role: string;
  dept?: string;
  av?: string;
  status: string;
  mustChangePassword?: boolean;
  clientId?: string;
  invitedAt?: string;
  invitedBy?: string;
}

// ── Paths ─────────────────────────────────────────────────────────────────────

const DATA_DIR   = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// ── Seed users (development / demo only) ─────────────────────────────────────
//
// Passwords here are plain-text intentionally — they will be migrated to
// scrypt hashes on the first successful login thanks to the needsRehash()
// check in the auth route. Never add real credentials here.

const SEED_USERS: ServerUser[] = [
  { id: "u1", name: "Issa Daouda",   email: "issa@hissado.com",    password: "admin123",   role: "admin",   av: "ID", dept: "Executive",   status: "active", mustChangePassword: false },
  { id: "u2", name: "Sarah Mitchell", email: "sarah@hissado.com",  password: "manager123", role: "manager", av: "SM", dept: "Engineering", status: "active", mustChangePassword: false },
  { id: "u3", name: "James Chen",    email: "james@hissado.com",   password: "member123",  role: "member",  av: "JC", dept: "Engineering", status: "active", mustChangePassword: false },
  { id: "u4", name: "Amara Diallo",  email: "amara@hissado.com",   password: "member123",  role: "member",  av: "AD", dept: "Design",       status: "active", mustChangePassword: false },
  { id: "u5", name: "Client Portal", email: "client@external.com", password: "client123",  role: "client",  av: "CP", dept: "External",     status: "active", mustChangePassword: false, clientId: "cl1" },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readUsers(): Promise<ServerUser[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    const stored: ServerUser[] = JSON.parse(raw);

    // Non-destructive seed merge: ensure every seed user is present.
    let changed = false;
    for (const seed of SEED_USERS) {
      if (!stored.find((u) => u.id === seed.id)) {
        stored.push(seed);
        changed = true;
      }
    }
    if (changed) await writeUsers(stored);
    return stored;
  } catch (err) {
    // File does not exist or is corrupt — start fresh from seed data.
    const users = [...SEED_USERS];
    await writeUsers(users);
    return users;
  }
}

/**
 * Atomic write: serialise to a temp file then rename into place.
 * This guarantees that readers never see a partially-written file.
 */
async function writeUsers(users: ServerUser[]): Promise<void> {
  await ensureDataDir();
  const tmp = `${USERS_FILE}.${randomBytes(4).toString("hex")}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(users, null, 2), "utf-8");
    await fs.rename(tmp, USERS_FILE);
  } catch (err) {
    // Clean up the temp file if the rename fails.
    await fs.unlink(tmp).catch(() => undefined);
    throw err;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<ServerUser[]> {
  return readUsers();
}

export async function findUserByEmail(email: string): Promise<ServerUser | undefined> {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<ServerUser | undefined> {
  const users = await readUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(
  user: ServerUser,
): Promise<{ ok: true; user: ServerUser } | { ok: false; error: string }> {
  const users = await readUsers();
  if (users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    return { ok: false, error: "A user with that email already exists." };
  }
  users.push(user);
  await writeUsers(users);
  return { ok: true, user };
}

export async function updateUser(
  id: string,
  updates: Partial<ServerUser>,
): Promise<ServerUser | null> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx]!, ...updates };
  await writeUsers(users);
  return users[idx]!;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  await writeUsers(users);
  return true;
}
