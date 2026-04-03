import { getDueReminders, markSent, markCancelled, isActiveRecently } from "./reminderStore.js";
import { getUncachableResendClient } from "./resend.js";
import { buildReminderEmail } from "./reminderEmail.js";
import { logger } from "./logger.js";

const INTERVAL_MS = 5 * 60 * 1000; // run every 5 minutes

export function startReminderJob(): void {
  logger.info("Reminder email job started — polling every 5 minutes");

  setInterval(async () => {
    try {
      const due = await getDueReminders();
      if (due.length === 0) return;

      logger.info({ count: due.length }, "Checking due reminders");

      for (const reminder of due) {
        /* If the recipient has been active recently, cancel the reminder */
        if (isActiveRecently(reminder.recipientId)) {
          await markCancelled(reminder.id);
          logger.info({ id: reminder.id, userId: reminder.recipientId }, "Reminder cancelled — user is active");
          continue;
        }

        try {
          const { client, fromEmail } = await getUncachableResendClient();
          const { subject, html } = buildReminderEmail(reminder);

          await client.emails.send({
            from: `Hissado <${fromEmail}>`,
            to: [reminder.recipientEmail],
            subject,
            html,
          });

          await markSent(reminder.id);
          logger.info(
            { id: reminder.id, to: reminder.recipientEmail, type: reminder.type },
            "Reminder email sent"
          );
        } catch (err: unknown) {
          logger.error({ err, id: reminder.id }, "Failed to send reminder email");
        }
      }
    } catch (err: unknown) {
      logger.error({ err }, "Reminder job error");
    }
  }, INTERVAL_MS);
}
