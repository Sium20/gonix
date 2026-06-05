/**
 * Email service. Console-only in development; pluggable for production.
 *
 * Backend selection (in priority order):
 *   1. EMAIL_BACKEND=resend  +  RESEND_API_KEY  → Resend
 *   2. (default)                                  → console.log (dev only)
 *
 * Resend is the recommended production provider. Add a verified sending
 * domain in the Resend dashboard and set EMAIL_FROM accordingly.
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Gonix";
const FROM = process.env.EMAIL_FROM || `${APP_NAME} <noreply@localhost>`;

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}

async function sendViaConsole(payload: EmailPayload): Promise<void> {
  const line = `\n[${new Date().toISOString()}] to=${payload.to} subject=${payload.subject}\n${payload.text || payload.html}\n${"-".repeat(60)}`;
  console.log(`[email] ${payload.subject} → ${payload.to}`);
  if (process.env.EMAIL_LOG_FILE) {
    try {
      const fs = await import("fs/promises");
      await fs.appendFile(process.env.EMAIL_LOG_FILE, line).catch(() => {});
    } catch {
      // ignore
    }
  }
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.EMAIL_BACKEND === "resend") {
    await sendViaResend(payload);
    return;
  }
  await sendViaConsole(payload);
}

export const emailTemplates = {
  registrationSubmitted: (name: string) => ({
    subject: `We received your ${APP_NAME} registration`,
    html: `<p>Hi ${name},</p><p>Your profile is now in the admin verification queue. We typically decide within 24–48 hours.</p><p>— ${APP_NAME}</p>`,
  }),
  verificationApproved: (name: string) => ({
    subject: `Your ${APP_NAME} profile is verified ✓`,
    html: `<p>Hi ${name},</p><p>Your profile is now live in the directory. Welcome aboard.</p><p>— ${APP_NAME}</p>`,
  }),
  verificationRejected: (name: string, reason: string) => ({
    subject: `${APP_NAME} verification could not be completed`,
    html: `<p>Hi ${name},</p><p>Unfortunately we could not verify your submission. Reason: <em>${reason}</em></p><p>You may re-submit with corrected information.</p><p>— ${APP_NAME}</p>`,
  }),
};
