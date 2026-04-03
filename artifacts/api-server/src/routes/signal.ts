import { Router, type Request, type Response } from "express";

const router = Router();

/* ── In-memory SSE client registry ── */
const clients = new Map<string, Set<Response>>();

function getOrCreate(userId: string): Set<Response> {
  if (!clients.has(userId)) clients.set(userId, new Set());
  return clients.get(userId)!;
}

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/* ── GET /api/signal/stream?userId=xxx  (SSE subscription) ── */
router.get("/signal/stream", (req: Request, res: Response) => {
  const userId = req.query["userId"] as string | undefined;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  getOrCreate(userId).add(res);

  const keepalive = setInterval(() => {
    try { res.write(": keepalive\n\n"); } catch { clearInterval(keepalive); }
  }, 20000);

  req.on("close", () => {
    clearInterval(keepalive);
    clients.get(userId)?.delete(res);
  });
});

/* ── POST /api/signal/send  (fire-and-forget signal) ── */
router.post("/signal/send", (req: Request, res: Response) => {
  const { to, event, data } = req.body as {
    to: string; event: string; data: unknown;
  };
  if (!to || !event) { res.status(400).json({ error: "to and event required" }); return; }

  const targets = clients.get(to);
  let delivered = 0;

  if (targets) {
    const dead: Response[] = [];
    for (const r of targets) {
      try {
        sendEvent(r, event, data);
        delivered++;
      } catch {
        dead.push(r);
      }
    }
    dead.forEach((r) => targets.delete(r));
  }

  res.json({ delivered });
});

export default router;
