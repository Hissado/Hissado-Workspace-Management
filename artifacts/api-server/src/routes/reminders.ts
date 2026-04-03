import { Router } from "express";
import {
  markActive,
  cancelRemindersForUser,
  registerReminder,
} from "../lib/reminderStore.js";
import { logger } from "../lib/logger.js";

const router = Router();

/* POST /api/heartbeat — mark user as active, cancel their pending reminders */
router.post("/heartbeat", async (req, res) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });

  markActive(userId);
  try {
    await cancelRemindersForUser(userId);
  } catch (err) {
    logger.warn({ err, userId }, "Failed to cancel reminders on heartbeat");
  }
  return res.json({ ok: true });
});

/* POST /api/reminders/register — register a pending email reminder */
router.post("/reminders/register", async (req, res) => {
  const {
    id, recipientId, recipientEmail, recipientName,
    type, summary, senderName, lang, scheduledAt,
  } = req.body as {
    id: string;
    recipientId: string;
    recipientEmail: string;
    recipientName: string;
    type: "message" | "call" | "notification";
    summary: string;
    senderName: string;
    lang?: string;
    scheduledAt: string;
  };

  if (!id || !recipientId || !recipientEmail || !type || !summary || !scheduledAt) {
    return res.status(400).json({ error: "Missing required reminder fields" });
  }

  try {
    await registerReminder({
      id,
      recipientId,
      recipientEmail,
      recipientName: recipientName || recipientEmail,
      type,
      summary,
      senderName: senderName || "Hissado",
      lang: lang || "en",
      scheduledAt,
    });
    logger.info({ id, recipientId, type, scheduledAt }, "Reminder registered");
    return res.json({ ok: true });
  } catch (err: unknown) {
    logger.error({ err }, "Failed to register reminder");
    return res.status(500).json({ error: "Failed to register reminder" });
  }
});

export default router;
