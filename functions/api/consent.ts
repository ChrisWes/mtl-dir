import { Env, getSessionUser, json } from './_shared';
import { sendEmail, welcomeEmail } from './_email';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  await env.DB.prepare(
    `UPDATE members SET consent_given = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  )
    .bind(user.id)
    .run();

  await sendEmail(env, user.email, 'Welcome to Midlands Tech Leaders', welcomeEmail(user.name));

  return json({ ok: true });
};
