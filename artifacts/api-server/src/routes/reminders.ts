import { Router } from "express";
import { z } from "zod";
import {
  markActive,
  cancelRemindersForUser,
  registerReminder,
} from "../lib/reminderStore.js";
import { logger } from "../lib/logger.js";
import { validate } from "../middleware/validate.js";
import { InternalError } from "../lib/errors.js";

const router = Router();

// ── Zod schemas ───────────────────────────────────────────────────────────────

const HeartbeatSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

const RegisterReminderSchema = z.object({
  id:             z.string().min(1, "id is required"),
  recipientId:    z.string().min(1, "recipientId is required"),
  recipientEmail: z.string().email("Invalid recipient email"),
  recipientName:  z.string().min(1, "recipientName is required"),
  type:           z.enum(["message", "call", "notification"]),
  summary:        z.string().min(1, "summary is required").max(500),
  senderName:     z.string().min(1, "senderName is required"),
  lang:           z.enum(["en", "fr"]).default("en"),
  scheduledAt:    z.string().datetime("scheduledAt must be an ISO 8601 datetime"),
});

// ── Routes ────────────────────────────────────────────────────────────────────

/* POST /api/heartbeat — mark user as active, cancel their pending reminders */
router.post("/heartbeat", validate(HeartbeatSchema), async (req, res, next) => {
  const { userId } = req.body as z.infer<typeof HeartbeatSchema>;
  markActive(userId);
  try {
    await cancelRemindersForUser(userId);
  } catch (err) {
    // Non-fatal: log and continue. The heartbeat itself must succeed.
    logger.warn({ err, userId }, "Failed to cancel reminders on heartbeat");
  }
  return res.json({ ok: true });
});

/* POST /api/reminders/register — schedule a pending email reminder */
router.post(
  "/reminders/register",
  validate(RegisterReminderSchema),
  async (req, res, next) => {
    const body = req.body as z.infer<typeof RegisterReminderSchema>;
    try {
      await registerReminder({
        ...body,
        recipientName: body.recipientName || body.recipientEmail,
        senderName:    body.senderName || "Hissado",
      });
      logger.info(
        { id: body.id, recipientId: body.recipientId, type: body.type, scheduledAt: body.scheduledAt },
        "Reminder registered",
      );
      return res.json({ ok: true });
    } catch (err) {
      logger.error({ err }, "Failed to register reminder");
      return next(new InternalError("Failed to register reminder"));
    }
  },
);

export default router;
