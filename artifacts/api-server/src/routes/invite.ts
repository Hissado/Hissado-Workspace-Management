import { Router } from "express";
import { getUncachableResendClient } from "../lib/resend.js";
import { buildInviteEmail } from "../lib/inviteEmail.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/invite", async (req, res) => {
  const { name, email, role, tempPassword, invitedBy, workspaceName, lang } = req.body as {
    name: string;
    email: string;
    role: string;
    tempPassword: string;
    invitedBy: string;
    workspaceName?: string;
    lang?: string;
  };

  if (!name || !email || !role || !tempPassword) {
    return res.status(400).json({ error: "Missing required fields: name, email, role, tempPassword" });
  }

  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const { subject, html } = buildInviteEmail({
      name,
      email,
      roleLabel: role.charAt(0).toUpperCase() + role.slice(1),
      tempPassword,
      invitedBy,
      workspaceName: workspaceName || "Hissado Client",
      lang: lang === "fr" ? "fr" : "en",
    });

    const result = await client.emails.send({
      from: `Hissado Consulting <${fromEmail}>`,
      to: [email],
      subject,
      html,
    });

    logger.info({ id: result.data?.id, to: email, lang }, "Invitation email sent");
    return res.json({ success: true, emailId: result.data?.id });
  } catch (err: any) {
    logger.error({ err }, "Failed to send invitation email");
    return res.status(500).json({ error: "Failed to send email", details: err?.message });
  }
});

export default router;
