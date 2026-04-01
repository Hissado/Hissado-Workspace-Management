// Resend integration — Replit connector with env var fallback
import { Resend } from "resend";

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  // 1. Try Replit connector first
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
    ? "depl " + process.env["WEB_REPL_RENEWAL"]
    : null;

  if (hostname && xReplitToken) {
    try {
      const connectionSettings = await fetch(
        "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
        {
          headers: {
            Accept: "application/json",
            "X-Replit-Token": xReplitToken,
          },
        }
      )
        .then((res) => res.json())
        .then((data: any) => data.items?.[0]);

      if (connectionSettings?.settings?.api_key) {
        return {
          apiKey: connectionSettings.settings.api_key,
          fromEmail: connectionSettings.settings.from_email || "onboarding@resend.dev",
        };
      }
    } catch {
      // Fall through to env var fallback
    }
  }

  // 2. Fall back to RESEND_API_KEY env var
  const apiKey = process.env["RESEND_API_KEY"];
  if (apiKey) {
    return {
      apiKey,
      fromEmail: process.env["RESEND_FROM_EMAIL"] || "onboarding@resend.dev",
    };
  }

  throw new Error("Resend not connected: configure the Resend integration or set RESEND_API_KEY");
}

// WARNING: Never cache this client — tokens expire
export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}
