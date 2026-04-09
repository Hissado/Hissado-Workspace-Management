import app from "./app.js";
import { logger } from "./lib/logger.js";
import { config } from "./lib/config.js";
import { startReminderJob } from "./lib/reminderJob.js";

app.listen(config.port, (err) => {
  if (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
  logger.info({ port: config.port, env: config.env }, "Server listening");
  startReminderJob();
});
