import { Router } from "express";
import { getUncachableResendClient } from "../lib/resend.js";
import { logger } from "../lib/logger.js";

const router = Router();

function buildEmailBody(opts: {
  name: string;
  email: string;
  roleLabel: string;
  tempPassword: string;
  invitedBy: string;
  ws: string;
  lang: string;
}): { subject: string; html: string } {
  const { name, email, roleLabel, tempPassword, invitedBy, ws, lang } = opts;
  const isFr = lang === "fr";

  const subject = isFr
    ? `Vous avez été invité(e) à rejoindre ${ws} — accès ${roleLabel}`
    : `You're invited to ${ws} — ${roleLabel} access`;

  const tagline = isFr
    ? "Là où les grands projets prennent vie."
    : "Where great projects come to life.";

  const greeting = isFr
    ? `Bonjour <strong style="color:#070D1A;">${name}</strong>,`
    : `Hi <strong style="color:#070D1A;">${name}</strong>,`;

  const inviteBody = isFr
    ? `<strong style="color:#070D1A;">${invitedBy}</strong> vous a invité(e) à rejoindre l'espace de travail <strong style="color:#070D1A;">${ws}</strong> en tant que <span style="display:inline-block;padding:2px 11px;border-radius:20px;background:rgba(201,169,110,0.12);color:#C9A96E;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1px solid rgba(201,169,110,0.3);vertical-align:middle;">${roleLabel}</span>.`
    : `<strong style="color:#070D1A;">${invitedBy}</strong> has invited you to join the <strong style="color:#070D1A;">${ws}</strong> workspace as a <span style="display:inline-block;padding:2px 11px;border-radius:20px;background:rgba(201,169,110,0.12);color:#C9A96E;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1px solid rgba(201,169,110,0.3);vertical-align:middle;">${roleLabel}</span>.`;

  const credentialsIntro = isFr
    ? "Voici vos identifiants de connexion :"
    : "Here are your login credentials to get started:";

  const credentialsHeader = isFr
    ? "&#128274; Vos identifiants d'accès"
    : "&#128274; Your Access Credentials";

  const emailLabel = isFr ? "Adresse e-mail" : "Email Address";
  const passwordLabel = isFr ? "Mot de passe temporaire" : "Temporary Password";
  const passwordHint = isFr
    ? "Utilisez ce mot de passe uniquement pour votre première connexion"
    : "Use this to sign in for the first time only";

  const roleLabel2 = isFr ? "Votre rôle" : "Your Role";

  const securityTitle = isFr ? "&#9888;&#65039; Avis de sécurité :" : "&#9888;&#65039; Security Notice:";
  const securityBody = isFr
    ? "Vous devrez définir un nouveau mot de passe dès votre première connexion. Veuillez conserver ces identifiants de façon confidentielle."
    : "You will be required to set a new password immediately upon first login. Please keep these credentials private and do not share them.";

  const ctaLabel = isFr ? "Se connecter à Hissado &rarr;" : "Sign In to Hissado &rarr;";

  const helpText = isFr
    ? "Pour toute question, veuillez contacter votre administrateur."
    : "If you have any questions, please contact your workspace administrator.";

  const footerText = isFr
    ? `Cette invitation a été envoyée par <strong>${invitedBy}</strong>. Si vous ne l'attendiez pas, vous pouvez l'ignorer.`
    : `This invitation was sent by <strong>${invitedBy}</strong>. If you did not expect this email, you can safely ignore it.`;

  const html = `
<!DOCTYPE html>
<html lang="${isFr ? "fr" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#EFF2F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF2F8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- HEADER / LOGO -->
          <tr>
            <td style="background:linear-gradient(160deg,#070D1A 0%,#0F1E35 100%);border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                <tr>
                  <td valign="middle" style="padding-right:12px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:46px;height:46px;background:linear-gradient(145deg,#C9A96E,#A8762E);border-radius:11px;text-align:center;vertical-align:middle;box-shadow:0 4px 16px rgba(201,169,110,0.35);">
                          <span style="color:#ffffff;font-size:24px;font-weight:800;line-height:46px;display:block;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;">H</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle">
                    <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.1em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.2;">HISSADO</div>
                    <div style="font-size:10px;font-weight:600;color:#C9A96E;letter-spacing:0.22em;text-transform:uppercase;margin-top:3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">PROJECT</div>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0;letter-spacing:0.02em;">${tagline}</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <h1 style="color:#070D1A;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.3;">
                ${subject}
              </h1>
              <p style="color:#4A5268;font-size:15px;line-height:1.7;margin:0 0 8px;">
                ${greeting}
              </p>
              <p style="color:#4A5268;font-size:15px;line-height:1.7;margin:0 0 28px;">
                ${inviteBody}
              </p>
              <p style="color:#4A5268;font-size:14px;margin:0 0 16px;font-weight:500;">
                ${credentialsIntro}
              </p>

              <!-- CREDENTIALS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #E0E4EF;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="background:#070D1A;padding:12px 20px;">
                    <span style="color:#C9A96E;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${credentialsHeader}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px 12px;border-bottom:1px solid #F0F2F8;background:#FAFBFD;">
                    <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">${emailLabel}</div>
                    <div style="font-size:14px;font-weight:600;color:#070D1A;font-family:'Courier New',Courier,monospace;word-break:break-all;">${email}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px 12px;border-bottom:1px solid #F0F2F8;background:#FAFBFD;">
                    <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">${passwordLabel}</div>
                    <table cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #C9A96E;background:linear-gradient(90deg,rgba(201,169,110,0.06) 0%,rgba(201,169,110,0.02) 100%);border-radius:0 8px 8px 0;padding:10px 16px;margin-top:2px;">
                      <tr>
                        <td>
                          <span style="font-size:18px;font-weight:800;color:#070D1A;font-family:'Courier New',Courier,monospace;letter-spacing:0.08em;">${tempPassword}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:10px;color:#9BA3B5;display:block;margin-top:4px;">${passwordHint}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;background:#FAFBFD;">
                    <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">${roleLabel2}</div>
                    <span style="display:inline-block;padding:5px 16px;border-radius:20px;background:rgba(201,169,110,0.1);color:#A8762E;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1.5px solid rgba(201,169,110,0.25);">${roleLabel}</span>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="color:#92400E;font-size:13px;margin:0;line-height:1.6;">
                      <strong>${securityTitle}</strong> ${securityBody}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://project.hissadoconsulting.com" style="display:inline-block;background:linear-gradient(135deg,#C9A96E 0%,#A8762E 100%);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:11px;font-weight:700;font-size:15px;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(201,169,110,0.35);">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9BA3B5;font-size:13px;line-height:1.6;margin:0;text-align:center;">
                ${helpText}
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F8F9FC;border-top:1px solid #E8EAF0;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="color:#9BA3B5;font-size:11px;margin:0;line-height:1.7;">
                &copy; ${new Date().getFullYear()} Hissado Project Management &mdash; hissadoconsulting.com<br>
                ${footerText}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

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

    const ws = workspaceName || "Hissado Project";
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    const emailLang = lang === "fr" ? "fr" : "en";

    const { subject, html } = buildEmailBody({
      name,
      email,
      roleLabel,
      tempPassword,
      invitedBy,
      ws,
      lang: emailLang,
    });

    const result = await client.emails.send({
      from: `Hissado Consulting <${fromEmail}>`,
      to: [email],
      subject,
      html,
    });

    logger.info({ id: result.data?.id, to: email, lang: emailLang }, "Invitation email sent");
    return res.json({ success: true, emailId: result.data?.id });
  } catch (err: any) {
    logger.error({ err }, "Failed to send invitation email");
    return res.status(500).json({ error: "Failed to send email", details: err?.message });
  }
});

export default router;
