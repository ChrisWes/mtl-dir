import type { Env } from './_shared';

// Mailjet REST API — uses the same credentials as their SMTP relay:
//   SMTP_USERNAME = Mailjet API key
//   SMTP_PASSWORD = Mailjet secret key
// Mirrors the Python smtplib pattern: errors are logged but never rethrown.

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!env.SMTP_USERNAME || !env.SMTP_PASSWORD || !env.EMAIL_FROM) {
    console.log('[email] Skipping — SMTP_USERNAME / SMTP_PASSWORD / EMAIL_FROM not configured');
    return;
  }

  try {
    const auth = btoa(`${env.SMTP_USERNAME}:${env.SMTP_PASSWORD}`);
    const res = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [{
          From: { Email: env.EMAIL_FROM, Name: 'Midlands Tech Leaders' },
          ReplyTo: { Email: 'chris.weston@gmail.com' },
          To: [{ Email: to }],
          Bcc: [{ Email: 'chris.weston@gmail.com' }],
          Subject: subject,
          HTMLPart: html,
        }],
      }),
    });

    if (!res.ok) {
      console.error(`[email] SMTPException: failed to send "${subject}" to ${to} — ${res.status} ${await res.text()}`);
    }
  } catch (e) {
    console.error(`[email] SMTPException: exception sending "${subject}" to ${to}:`, e);
  }
}

export function welcomeEmail(name: string | null): string {
  const displayName = name ?? 'there';
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:32px 16px;background:#09090b;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr><td>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">Midlands Tech Leaders</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#f4f4f5;line-height:1.3;">Thanks for signing up, ${displayName}!</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#a1a1aa;">Your account has been created and is currently <strong style="color:#f4f4f5;">pending approval</strong>. We'll review it shortly.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#a1a1aa;">Once approved, please update your details as much as you can as that makes this more valuable to the community at large. You can do this by clicking/pressing your name or pic at the top right of the app.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#a1a1aa;">We'll send you another email as soon as you're in.</p>
        <hr style="border:none;border-top:1px solid #27272a;margin:24px 0;" />
        <p style="margin:0;font-size:13px;color:#52525b;font-style:italic;">Built for the community, for the community.</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

export function approvedEmail(name: string | null, siteUrl: string): string {
  const displayName = name ?? 'there';
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:32px 16px;background:#09090b;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr><td>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">Midlands Tech Leaders</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#f4f4f5;line-height:1.3;">You're approved, ${displayName}! 🎉</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#a1a1aa;">Great news — your Midlands Tech Leaders account has been approved. You now have full access to the member directory.</p>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#a1a1aa;">Complete your profile so other members can find and connect with you.</p>
        <a href="${siteUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;">Access the directory →</a>
        <hr style="border:none;border-top:1px solid #27272a;margin:28px 0;" />
        <p style="margin:0;font-size:13px;color:#52525b;font-style:italic;">Built for the community, for the community.</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}
