import { Router } from "express";
import { z } from "zod";
import { getUncachableResendClient } from "../lib/resend.js";
import { buildInviteEmail } from "../lib/inviteEmail.js";
import { logger } from "../lib/logger.js";
import { validate } from "../middleware/validate.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { InternalError } from "../lib/errors.js";

const router = Router();

// ── Zod schema ────────────────────────────────────────────────────────────────

const InviteSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  email: z.string().email("Invalid recipient email"),
  role: z.string().min(1, "role is required").max(50),
  tempPassword: z.string().min(1, "tempPassword is required").max(128),
  invitedBy: z.string().min(1, "invitedBy is required").max(100),
  workspaceName: z.string().max(100).optional(),
  lang: z.enum(["en", "fr"]).default("en"),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Escapes HTML special characters to prevent injection in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Route ─────────────────────────────────────────────────────────────────────

/* POST /api/invite */
router.post(
  "/invite",
  // Strict rate limit — invitation emails cost money and can be used for spam.
  rateLimiter({ windowMs: 60 * 60_000, limit: 20 }),
  validate(InviteSchema),
  async (req, res, next) => {
    const body = req.body as z.infer<typeof InviteSchema>;

    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const { subject, html } = buildInviteEmail({
        name:          escapeHtml(body.name),
        email:         body.email,
        roleLabel:     body.role.charAt(0).toUpperCase() + body.role.slice(1),
        tempPassword:  body.tempPassword,
        invitedBy:     escapeHtml(body.invitedBy),
        workspaceName: escapeHtml(body.workspaceName ?? "Hissado Client"),
        lang:          body.lang,
      });

      const result = await client.emails.send({
        from: `Hissado Consulting <${fromEmail}>`,
        to: [body.email],
        subject,
        html,
      });

      logger.info({ id: result.data?.id, to: body.email, lang: body.lang }, "Invitation email sent");
      return res.json({ success: true, emailId: result.data?.id });
    } catch (err) {
      logger.error({ err }, "Failed to send invitation email");
      return next(new InternalError("Failed to send invitation email"));
    }
  },
);

export default router;
