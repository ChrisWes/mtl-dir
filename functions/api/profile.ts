import { Env, getSessionUser, json, parseTechStack } from './_shared';

const ALLOWED_ROLES = [
  'CTO', 'VP Engineering', 'Director of Engineering', 'Engineering Manager',
  'Staff Engineer', 'Principal Engineer', 'Senior Engineer', 'Architect',
  'Founder', 'Co-Founder', 'Other',
];

const ALLOWED_TECH = [
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Remix', 'Node.js',
  'Python', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift', 'TypeScript',
  'GraphQL', 'tRPC', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  return json({
    user: { ...user, tech_stack: parseTechStack(user.tech_stack) },
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
  const role = typeof body.role === 'string' && ALLOWED_ROLES.includes(body.role) ? body.role : null;
  const linkedin_url = typeof body.linkedin_url === 'string' ? body.linkedin_url.slice(0, 300) : null;
  const twitter_url = typeof body.twitter_url === 'string' ? body.twitter_url.slice(0, 300) : null;
  const website_url = typeof body.website_url === 'string' ? body.website_url.slice(0, 300) : null;

  const rawTech = Array.isArray(body.tech_stack) ? body.tech_stack : [];
  const tech_stack = JSON.stringify(
    rawTech.filter((t): t is string => typeof t === 'string' && ALLOWED_TECH.includes(t)),
  );

  await env.DB.prepare(
    `UPDATE members SET
      name = ?, bio = ?, location = ?, company = ?, role = ?,
      tech_stack = ?, linkedin_url = ?, twitter_url = ?, website_url = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(name, bio, location, company, role, tech_stack, linkedin_url, twitter_url, website_url, user.id)
    .run();

  const updated = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(user.id).first();
  return json({ user: { ...(updated as object), tech_stack: parseTechStack(tech_stack) } });
};
