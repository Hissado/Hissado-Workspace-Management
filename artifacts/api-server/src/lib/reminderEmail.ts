import type { Reminder } from "./reminderStore.js";

type EmailContent = { subject: string; html: string };

const APP_URL = process.env["APP_URL"] ?? "https://client.hissadoconsulting.com";

export function buildReminderEmail(r: Reminder): EmailContent {
  const YEAR = new Date().getFullYear();
  const isFr = r.lang === "fr";

  const typeLabels: Record<Reminder["type"], { en: string; fr: string; icon: string }> = {
    message:      { en: "New Message",       fr: "Nouveau message",         icon: "💬" },
    call:         { en: "Missed Call",        fr: "Appel manqué",            icon: "📞" },
    notification: { en: "Pending Activity",   fr: "Activité en attente",     icon: "🔔" },
  };

  const label = typeLabels[r.type];
  const typeStr = isFr ? label.fr : label.en;

  const subject = isFr
    ? `${label.icon} ${typeStr} — vous avez de l'activité non lue dans Hissado`
    : `${label.icon} ${typeStr} — you have unread activity in Hissado`;

  const tagline = isFr
    ? "Là où les grands projets prennent vie."
    : "Where great projects come to life.";

  const greeting = isFr
    ? `Bonjour <strong style="color:#070D1A;">${r.recipientName}</strong>,`
    : `Hi <strong style="color:#070D1A;">${r.recipientName}</strong>,`;

  const bodyIntro = isFr
    ? `Vous avez <strong>${typeStr.toLowerCase()}</strong> qui attend votre attention dans votre espace de travail Hissado.`
    : `You have a <strong>${typeStr.toLowerCase()}</strong> waiting for your attention in your Hissado workspace.`;

  const summaryLabel = isFr ? "Détails" : "Details";
  const fromLabel    = isFr ? "De la part de" : "From";
  const typeLabel    = isFr ? "Type" : "Type";
  const ctaLabel     = isFr ? "Ouvrir mon espace de travail &rarr;" : "Open My Workspace &rarr;";

  const reminderNote = isFr
    ? "Cette notification a été envoyée car vous n'avez pas ouvert l'application dans l'heure suivant la réception de cette activité."
    : "This notification was sent because you hadn't opened the app within 1 hour of receiving this activity.";

  const footerText = isFr
    ? "Pour ne plus recevoir ces rappels, restez connecté(e) à votre espace Hissado."
    : "To stop receiving these reminders, stay signed in to your Hissado workspace.";

  const html = `<!DOCTYPE html>
<html lang="${isFr ? "fr" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#EFF2F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF2F8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(160deg,#070D1A 0%,#0F1E35 100%);border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
              <tr>
                <td valign="middle" style="padding-right:12px;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="width:46px;height:46px;background:linear-gradient(145deg,#C9A96E,#A8762E);border-radius:11px;text-align:center;vertical-align:middle;box-shadow:0 4px 16px rgba(201,169,110,0.35);">
                      <span style="color:#fff;font-size:24px;font-weight:800;line-height:46px;display:block;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;">H</span>
                    </td>
                  </tr></table>
                </td>
                <td valign="middle">
                  <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:0.1em;">HISSADO</div>
                  <div style="font-size:10px;font-weight:600;color:#C9A96E;letter-spacing:0.22em;text-transform:uppercase;margin-top:3px;">PROJECT</div>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0;">${tagline}</p>
          </td>
        </tr>

        <!-- ACTIVITY BADGE -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(201,169,110,0.15),rgba(201,169,110,0.05));border:1.5px solid rgba(201,169,110,0.3);border-radius:50px;padding:10px 22px;text-align:center;">
                  <span style="font-size:16px;margin-right:8px;">${label.icon}</span>
                  <span style="color:#A8762E;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${typeStr}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 32px;">
            <p style="color:#4A5268;font-size:15px;line-height:1.7;margin:0 0 8px;">${greeting}</p>
            <p style="color:#4A5268;font-size:15px;line-height:1.7;margin:0 0 28px;">${bodyIntro}</p>

            <!-- ACTIVITY CARD -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #E0E4EF;border-radius:14px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="background:#070D1A;padding:12px 20px;">
                  <span style="color:#C9A96E;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
                    ${isFr ? "🔔 Activité en attente" : "🔔 Pending Activity"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px 12px;border-bottom:1px solid #F0F2F8;background:#FAFBFD;">
                  <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">${typeLabel}</div>
                  <span style="display:inline-block;padding:4px 14px;border-radius:20px;background:rgba(201,169,110,0.1);color:#A8762E;font-size:13px;font-weight:700;letter-spacing:0.05em;border:1.5px solid rgba(201,169,110,0.25);">${typeStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px 12px;border-bottom:1px solid #F0F2F8;background:#FAFBFD;">
                  <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">${fromLabel}</div>
                  <div style="font-size:14px;font-weight:600;color:#070D1A;">${r.senderName}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;background:#FAFBFD;">
                  <div style="font-size:10px;font-weight:700;color:#9BA3B5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">${summaryLabel}</div>
                  <div style="font-size:14px;color:#374151;line-height:1.6;font-style:italic;">"${r.summary.slice(0, 200)}${r.summary.length > 200 ? "…" : ""}"</div>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A96E 0%,#A8762E 100%);color:#fff;text-decoration:none;padding:15px 40px;border-radius:11px;font-weight:700;font-size:15px;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(201,169,110,0.35);">
                    ${ctaLabel}
                  </a>
                </td>
              </tr>
            </table>

            <!-- Note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FC;border:1px solid #E8EAF0;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="color:#6B7280;font-size:12px;margin:0;line-height:1.6;">${reminderNote}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8F9FC;border-top:1px solid #E8EAF0;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="color:#9BA3B5;font-size:11px;margin:0;line-height:1.7;">
              &copy; ${YEAR} Hissado Client &mdash; hissadoconsulting.com<br>
              ${footerText}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
