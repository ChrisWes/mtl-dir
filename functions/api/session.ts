import { Env, getSessionUser, json } from './_shared';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return json({ ok: true });

  const token = auth.slice(7);

  // Verify the session belongs to a real user before deleting
  const user = await getSessionUser(request, env);
  if (user) {
    await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
  }

  return json({ ok: true });
};
