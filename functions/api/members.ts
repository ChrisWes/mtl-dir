import { Env, getSessionUser, json, parseTechStack, MemberRow } from './_shared';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  if (user.status !== 'approved') return json({ error: 'Forbidden' }, 403);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const roleFilter = searchParams.get('role')?.trim() ?? '';
  const techFilter = searchParams.get('tech')?.trim() ?? '';

  const { results } = await env.DB.prepare(
    `SELECT * FROM members WHERE status = 'approved' ORDER BY LOWER(COALESCE(name, email)) ASC`,
  ).all<MemberRow>();

  let members = (results ?? []).map((m) => ({
    ...m,
    tech_stack: parseTechStack(m.tech_stack),
  }));

  if (q) {
    const lower = q.toLowerCase();
    members = members.filter(
      (m) =>
        m.name?.toLowerCase().includes(lower) ||
        m.bio?.toLowerCase().includes(lower) ||
        m.company?.toLowerCase().includes(lower) ||
        m.email.toLowerCase().includes(lower),
    );
  }

  if (roleFilter) {
    members = members.filter((m) => m.role === roleFilter);
  }

  if (techFilter) {
    members = members.filter((m) =>
      (m.tech_stack as string[]).includes(techFilter),
    );
  }

  return json({ members });
};
