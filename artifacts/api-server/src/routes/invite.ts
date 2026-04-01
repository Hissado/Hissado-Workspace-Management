import { Router } from "express";
import { getUncachableResendClient } from "../lib/resend.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/invite", async (req, res) => {
  const { name, email, role, tempPassword, invitedBy, workspaceName } = req.body as {
    name: string;
    email: string;
    role: string;
    tempPassword: string;
    invitedBy: string;
    workspaceName?: string;
  };

  if (!name || !email || !role || !tempPassword) {
    return res.status(400).json({ error: "Missing required fields: name, email, role, tempPassword" });
  }

  try {
    const { client, fromEmail } = await getUncachableResendClient();

    const ws = workspaceName || "Hissado";
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 40px 16px; }
    .card { background: #ffffff; border-radius: 16px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #070D1A 0%, #0F1E35 100%); padding: 40px 40px 32px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; }
    .logo-icon { width: 44px; height: 44px; background: #C9A96E; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #070D1A; }
    .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; }
    .logo-sub { font-size: 11px; color: #C9A96E; letter-spacing: 0.15em; text-transform: uppercase; display: block; margin-top: 2px; }
    .tagline { color: #9BA3B5; font-size: 13px; margin-top: 16px; }
    .body { padding: 40px; }
    h1 { color: #070D1A; font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { color: #4A5268; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .credentials { background: #F8F9FC; border: 1px solid #E0E4EF; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #E0E4EF; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { font-size: 13px; color: #6B7A99; font-weight: 500; }
    .cred-value { font-size: 13px; color: #070D1A; font-weight: 700; font-family: monospace; }
    .role-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; background: #C9A96E22; color: #C9A96E; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid #C9A96E40; }
    .btn { display: inline-block; background: linear-gradient(135deg, #C9A96E, #B8934A); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 8px 0 24px; }
    .warning { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #92400E; margin-bottom: 24px; }
    .footer { background: #F8F9FC; border-top: 1px solid #E0E4EF; padding: 24px 40px; text-align: center; color: #9BA3B5; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">H</div>
        <div>
          <div class="logo-text">HISSADO</div>
          <span class="logo-sub">Project</span>
        </div>
      </div>
      <p class="tagline">Where great projects come to life.</p>
    </div>
    <div class="body">
      <h1>You've been invited to ${ws}</h1>
      <p>Hi <strong>${name}</strong>,</p>
      <p><strong>${invitedBy}</strong> has invited you to join the <strong>${ws}</strong> workspace as a <span class="role-badge">${roleLabel}</span>.</p>
      <p>Here are your login credentials to get started:</p>
      <div class="credentials">
        <div class="cred-row">
          <span class="cred-label">Email</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password</span>
          <span class="cred-value">${tempPassword}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Your Role</span>
          <span class="cred-value">${roleLabel}</span>
        </div>
      </div>
      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> You will be required to change your password immediately upon first login. Please keep your credentials private.
      </div>
      <p style="text-align:center">
        <a class="btn" href="https://hissado.replit.app">Sign In to Hissado →</a>
      </p>
      <p>If you have any questions, contact your workspace administrator.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hissado Project Management. This invitation was sent by ${invitedBy}.<br>If you didn't expect this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;

    const result = await client.emails.send({
      from: fromEmail || "Hissado <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to ${ws} — ${roleLabel} access`,
      html: htmlBody,
    });

    logger.info({ id: result.data?.id, to: email }, "Invitation email sent");
    return res.json({ success: true, emailId: result.data?.id });
  } catch (err: any) {
    logger.error({ err }, "Failed to send invitation email");
    return res.status(500).json({ error: "Failed to send email", details: err?.message });
  }
});

export default router;
