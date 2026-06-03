import { Env, getSessionUser, json, parseTechStack } from '../_shared';
import { sendEmail, approvedEmail } from '../_email';

const ADMIN_EMAIL = 'chris.weston@gmail.com';

interface AdminMemberRow {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  role: string | null;
  tech_stack: string;
  ask_me_about: string;
  contact_email: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  consent_given: number;
  status: 'pending' | 'approved';
  created_at: string;
  updated_at: string;
}

async function requireAdmin(request: Request, env: Env) {
  const user = await getSessionUser(request, env);
  if (!user) return { user: null, err: json({ error: 'Unauthorized' }, 401) };
  if (user.email !== ADMIN_EMAIL) return { user: null, err: json({ error: 'Forbidden' }, 403) };
  return { user, err: null };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { err } = await requireAdmin(request, env);
  if (err) return err;

  const { results } = await env.DB.prepare(
    `SELECT * FROM members WHERE consent_given = 1 ORDER BY created_at DESC`,
  ).all<AdminMemberRow>();

  const users = (results ?? []).map((u) => ({
    ...u,
    tech_stack: parseTechStack(u.tech_stack),
    ask_me_about: parseTechStack(u.ask_me_about),
  }));

  return json({ users });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { err } = await requireAdmin(request, env);
  if (err) return err;

  let body: { id?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.id) return json({ error: 'Missing id' }, 400);
  if (body.status !== 'pending' && body.status !== 'approved') {
    return json({ error: 'status must be pending or approved' }, 400);
  }

  await env.DB.prepare(
    `UPDATE members SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  )
    .bind(body.status, body.id)
    .run();

  // Send approval email when a member is approved
  if (body.status === 'approved') {
    const member = await env.DB.prepare('SELECT email, name FROM members WHERE id = ?')
      .bind(body.id)
      .first<{ email: string; name: string | null }>();
    if (member) {
      const siteUrl = new URL(context.request.url).origin;
      context.waitUntil(
        sendEmail(env, member.email, "You're approved — welcome to Midlands Tech Leaders!", approvedEmail(member.name, siteUrl)),
      );
    }
  }

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { err } = await requireAdmin(request, env);
  if (err) return err;

  const raw = new URL(request.url).searchParams.get('id');
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) {
    return json({ error: 'Invalid id' }, 400);
  }

  await env.DB.prepare(`DELETE FROM members WHERE id = ?`).bind(id).run();

  return json({ ok: true });
};
