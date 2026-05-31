import { Env, getSessionUser, json, parseTechStack } from '../_shared';

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
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
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
    `SELECT * FROM members ORDER BY created_at DESC`,
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

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { err } = await requireAdmin(request, env);
  if (err) return err;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: 'Missing id' }, 400);

  await env.DB.prepare(`DELETE FROM members WHERE id = ?`).bind(id).run();

  return json({ ok: true });
};
