import { promises as fs } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "reminders.json");

export interface Reminder {
  id: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  type: "message" | "call" | "notification";
  summary: string;
  senderName: string;
  lang: string;
  scheduledAt: string;
  sent: boolean;
  cancelled: boolean;
}

/* ── In-memory heartbeat tracking (resets on server restart — that's fine) ── */
const lastSeenMs = new Map<string, number>();

export function markActive(userId: string): void {
  lastSeenMs.set(userId, Date.now());
}

/** Returns true if the user sent a heartbeat within the last 70 minutes */
export function isActiveRecently(userId: string): boolean {
  const ts = lastSeenMs.get(userId);
  return ts !== undefined && Date.now() - ts < 70 * 60 * 1000;
}

/* ── Persistence helpers ── */
async function load(): Promise<Reminder[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

async function save(reminders: Reminder[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(reminders, null, 2));
}

/* ── Public API ── */
export async function registerReminder(
  r: Omit<Reminder, "sent" | "cancelled">
): Promise<void> {
  const reminders = await load();
  reminders.push({ ...r, sent: false, cancelled: false });
  await save(reminders.slice(-1000));
}

export async function cancelRemindersForUser(userId: string): Promise<void> {
  const reminders = await load();
  let changed = false;
  for (const r of reminders) {
    if (r.recipientId === userId && !r.sent && !r.cancelled) {
      r.cancelled = true;
      changed = true;
    }
  }
  if (changed) await save(reminders);
}

export async function getDueReminders(): Promise<Reminder[]> {
  const reminders = await load();
  const now = Date.now();
  return reminders.filter(
    (r) => !r.sent && !r.cancelled && new Date(r.scheduledAt).getTime() <= now
  );
}

export async function markSent(id: string): Promise<void> {
  const reminders = await load();
  const r = reminders.find((x) => x.id === id);
  if (r) { r.sent = true; await save(reminders); }
}

export async function markCancelled(id: string): Promise<void> {
  const reminders = await load();
  const r = reminders.find((x) => x.id === id);
  if (r) { r.cancelled = true; await save(reminders); }
}
