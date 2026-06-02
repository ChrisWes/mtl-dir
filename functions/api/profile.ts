import { Env, getSessionUser, json, parseTechStack } from './_shared';

const LINKEDIN_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\//i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  return json({
    user: {
      ...user,
      tech_stack: parseTechStack(user.tech_stack),
      ask_me_about: parseTechStack(user.ask_me_about),
    },
  });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const name = typeof body.name === 'string' ? body.name.slice(0, 120) : null;
  const bio = typeof body.bio === 'string' ? body.bio.slice(0, 500) : null;
  const location = typeof body.location === 'string' ? body.location.slice(0, 100) : null;
  const company = typeof body.company === 'string' ? body.company.slice(0, 100) : null;
  const linkedin_url = typeof body.linkedin_url === 'string' ? body.linkedin_url.slice(0, 300) : null;

  const contact_email_raw = typeof body.contact_email === 'string' ? body.contact_email.trim().slice(0, 200) : null;
  if (contact_email_raw && !EMAIL_RE.test(contact_email_raw)) {
    return json({ error: 'Invalid contact email address' }, 400);
  }
  const contact_email = contact_email_raw || null;

  if (linkedin_url && !LINKEDIN_RE.test(linkedin_url)) {
    return json({ error: 'Invalid LinkedIn URL — must start with linkedin.com/in/' }, 400);
  }

  const high_contrast = body.high_contrast === true ? 1 : 0;

  const rawTags = Array.isArray(body.ask_me_about) ? body.ask_me_about : [];
  const ask_me_about = JSON.stringify(
    rawTags.filter((t): t is string => typeof t === 'string').slice(0, 20).map((s) => s.slice(0, 60)),
  );

  // avatar_url: accept base64 data URLs or existing https:// URLs; reject anything else
  let avatar_url: string | null = user.avatar_url; // default: keep existing
  if (Object.prototype.hasOwnProperty.call(body, 'avatar_url')) {
    const raw = body.avatar_url;
    if (raw === null || raw === '') {
      avatar_url = null;
    } else if (typeof raw === 'string') {
      if (!raw.startsWith('data:image/') && !raw.startsWith('https://')) {
        return json({ error: 'Invalid avatar URL' }, 400);
      }
      if (raw.length > 250_000) {
        return json({ error: 'Avatar image too large — please use a smaller photo' }, 400);
      }
      avatar_url = raw;
    }
  }

  await env.DB.prepare(
    `UPDATE members SET
      name = ?, bio = ?, location = ?, company = ?,
      contact_email = ?, linkedin_url = ?, ask_me_about = ?,
      avatar_url = ?, high_contrast = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(name, bio, location, company, contact_email, linkedin_url, ask_me_about, avatar_url, high_contrast, user.id)
    .run();

  const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?')
    .bind(user.id)
    .first<{ tech_stack: string; ask_me_about: string } & Record<string, unknown>>();

  if (!updated) return json({ error: 'Failed to fetch updated profile' }, 500);

  return json({
    user: {
      ...updated,
      tech_stack: parseTechStack(updated.tech_stack),
      ask_me_about: parseTechStack(updated.ask_me_about),
    },
  });
};
