import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { validate, validateQuery } from "../middleware/validate.js";
import { BadRequestError } from "../lib/errors.js";

const router = Router();

// ── Zod schemas ───────────────────────────────────────────────────────────────

const StreamQuerySchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

const SendSchema = z.object({
  to: z.string().min(1, "to is required"),
  event: z.string().min(1, "event is required"),
  data: z.unknown().optional(),
});

const BroadcastSchema = z.object({
  event: z.string().min(1, "event is required"),
  data: z.unknown().optional(),
  excludeUserId: z.string().optional(),
});

// ── In-memory SSE client registry ────────────────────────────────────────────
//
// Clients are keyed by userId and grouped in a Set so multiple tabs/windows
// for the same user all receive events.
//
// This is an in-process store. On server restart all connections drop and
// clients reconnect via the exponential-backoff logic in useRealtime.ts.
// For a multi-process deployment, replace this with a Redis pub/sub bus.

const clients = new Map<string, Set<Response>>();

function getOrCreateClientSet(userId: string): Set<Response> {
  let set = clients.get(userId);
  if (!set) {
    set = new Set();
    clients.set(userId, set);
  }
  return set;
}

function writeEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function pruneDeadConnections(userId: string, dead: Response[]): void {
  const set = clients.get(userId);
  if (!set) return;
  for (const r of dead) set.delete(r);
  if (set.size === 0) clients.delete(userId);
}

// ── Routes ────────────────────────────────────────────────────────────────────

/* GET /api/signal/stream?userId=xxx  (SSE subscription) */
router.get(
  "/signal/stream",
  validateQuery(StreamQuerySchema),
  (req: Request, res: Response) => {
    const { userId } = req.query as z.infer<typeof StreamQuerySchema>;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Connection", "keep-alive");
    // Disable Nginx response buffering so events flush immediately.
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Confirm connection to the client.
    writeEvent(res, "connected", { userId });

    getOrCreateClientSet(userId).add(res);

    // Send a keepalive comment every 20 s to prevent proxy timeouts.
    const keepalive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(keepalive);
      }
    }, 20_000);

    req.on("close", () => {
      clearInterval(keepalive);
      const set = clients.get(userId);
      if (set) {
        set.delete(res);
        if (set.size === 0) clients.delete(userId);
      }
    });
  },
);

/* POST /api/signal/send  (fire-and-forget signal to one user) */
router.post(
  "/signal/send",
  validate(SendSchema),
  (req: Request, res: Response) => {
    const { to, event, data } = req.body as z.infer<typeof SendSchema>;
    const targets = clients.get(to);
    let delivered = 0;
    const dead: Response[] = [];

    if (targets) {
      for (const r of targets) {
        try {
          writeEvent(r, event, data ?? {});
          delivered++;
        } catch {
          dead.push(r);
        }
      }
      pruneDeadConnections(to, dead);
    }

    res.json({ delivered });
  },
);

/* POST /api/signal/broadcast  (send event to ALL connected users) */
router.post(
  "/signal/broadcast",
  validate(BroadcastSchema),
  (req: Request, res: Response) => {
    const { event, data, excludeUserId } = req.body as z.infer<typeof BroadcastSchema>;
    let delivered = 0;
    const allDead: { userId: string; res: Response }[] = [];

    for (const [userId, connections] of clients.entries()) {
      if (excludeUserId && userId === excludeUserId) continue;
      for (const r of connections) {
        try {
          writeEvent(r, event, data ?? {});
          delivered++;
        } catch {
          allDead.push({ userId, res: r });
        }
      }
    }

    for (const { userId, res: r } of allDead) {
      pruneDeadConnections(userId, [r]);
    }

    res.json({ delivered });
  },
);

export default router;
