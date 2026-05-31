import { Env, verifyGoogleJWT, json } from './_shared';

function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: { credential?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.credential) return json({ error: 'Missing credential' }, 400);

  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return json({ error: 'Server misconfigured: missing GOOGLE_CLIENT_ID' }, 500);

  const payload = await verifyGoogleJWT(body.credential, clientId);
  if (!payload) return json({ error: 'Invalid or expired Google token' }, 401);

  const { email, name, picture: avatar_url } = payload;

  // Upsert member — insert if not exists, leave status unchanged if exists
  await env.DB.prepare(
    `INSERT INTO members (email, name, avatar_url, status)
     VALUES (?, ?, ?, 'pending')
     ON CONFLICT(email) DO UPDATE SET
       name = COALESCE(excluded.name, members.name),
       avatar_url = COALESCE(excluded.avatar_url, members.avatar_url),
       updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(email, name ?? null, avatar_url ?? null)
    .run();

  const member = await env.DB.prepare('SELECT * FROM members WHERE email = ?')
    .bind(email)
    .first<{
      id: number;
      email: string;
      name: string | null;
      bio: string | null;
      location: string | null;
      company: string | null;
      role: string | null;
      tech_stack: string;
      linkedin_url: string | null;
      twitter_url: string | null;
      website_url: string | null;
      avatar_url: string | null;
      status: string;
    }>();

  if (!member) return json({ error: 'Failed to fetch member' }, 500);

  // Create a session that lasts 7 days
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(sessionId, member.id, expiresAt)
    .run();

  // Clean up expired sessions for this user
  await env.DB.prepare(
    `DELETE FROM sessions WHERE user_id = ? AND expires_at <= datetime('now')`,
  )
    .bind(member.id)
    .run();

  return json({
    sessionToken: sessionId,
    user: {
      ...member,
      tech_stack: (() => { try { return JSON.parse(member.tech_stack ?? '[]'); } catch { return []; } })(),
    },
  });
};
