import fs from "fs";
import path from "path";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
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

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/* Seed accounts — mirrors frontend SEED_USERS */
const SEED_USERS: ServerUser[] = [
  { id: "u1", name: "Issa Daouda",      email: "issa@hissado.com",    password: "admin123",   role: "admin",   av: "ID", dept: "Executive",    status: "active", mustChangePassword: false },
  { id: "u2", name: "Sarah Mitchell",   email: "sarah@hissado.com",   password: "manager123", role: "manager", av: "SM", dept: "Engineering",  status: "active", mustChangePassword: false },
  { id: "u3", name: "James Chen",       email: "james@hissado.com",   password: "member123",  role: "member",  av: "JC", dept: "Engineering",  status: "active", mustChangePassword: false },
  { id: "u4", name: "Amara Diallo",     email: "amara@hissado.com",   password: "member123",  role: "member",  av: "AD", dept: "Design",        status: "active", mustChangePassword: false },
  { id: "u5", name: "Client Portal",    email: "client@external.com", password: "client123",  role: "client",  av: "CP", dept: "External",      status: "active", mustChangePassword: false, clientId: "cl1" },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readUsers(): ServerUser[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(SEED_USERS, null, 2));
    return [...SEED_USERS];
  }
  try {
    const stored: ServerUser[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    /* Ensure every seed user is present (non-destructive merge) */
    let changed = false;
    for (const seed of SEED_USERS) {
      if (!stored.find((u) => u.id === seed.id)) {
        stored.push(seed);
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(USERS_FILE, JSON.stringify(stored, null, 2));
    return stored;
  } catch {
    return [...SEED_USERS];
  }
}

function writeUsers(users: ServerUser[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function getAllUsers(): ServerUser[] {
  return readUsers();
}

export function findUserByEmail(email: string): ServerUser | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): ServerUser | undefined {
  return readUsers().find((u) => u.id === id);
}

export function createUser(user: ServerUser): { ok: true; user: ServerUser } | { ok: false; error: string } {
  const users = readUsers();
  if (users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    return { ok: false, error: "A user with that email already exists." };
  }
  users.push(user);
  writeUsers(users);
  return { ok: true, user };
}

export function updateUser(id: string, updates: Partial<ServerUser>): ServerUser | null {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  writeUsers(users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  writeUsers(users);
  return true;
}
