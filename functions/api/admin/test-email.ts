import { Env, getSessionUser, json } from '../_shared';

const ADMIN_EMAIL = 'chris.weston@gmail.com';

// Diagnostic endpoint — hit GET /api/admin/test-email to send a test email
// and see the full Mailjet response. Remove once emails are confirmed working.
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const user = await getSessionUser(request, env);
  if (!user || user.email !== ADMIN_EMAIL) return json({ error: 'Forbidden' }, 403);

  // Report what credentials are visible
  const credCheck = {
    SMTP_USERNAME: env.SMTP_USERNAME ? `set (${env.SMTP_USERNAME.slice(0, 4)}…)` : 'MISSING',
    SMTP_PASSWORD: env.SMTP_PASSWORD ? 'set' : 'MISSING',
    EMAIL_FROM: env.EMAIL_FROM ?? 'MISSING',
  };

  if (!env.SMTP_USERNAME || !env.SMTP_PASSWORD || !env.EMAIL_FROM) {
    return json({ error: 'Credentials not configured', credCheck });
  }

  const auth = btoa(`${env.SMTP_USERNAME}:${env.SMTP_PASSWORD}`);

  const mjRes = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: env.EMAIL_FROM, Name: 'Midlands Tech Leaders' },
        To: [{ Email: ADMIN_EMAIL }],
        Subject: 'MTL email test',
        TextPart: 'If you received this, email sending is working correctly.',
      }],
    }),
  });

  const mjBody = await mjRes.text();

  return json({
    credCheck,
    mailjetStatus: mjRes.status,
    mailjetResponse: (() => { try { return JSON.parse(mjBody); } catch { return mjBody; } })(),
  });
};
