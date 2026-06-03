export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  EMAIL_FROM?: string;
}

export interface MemberRow {
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
  secondary_email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
  consent_given: number;
  high_contrast: number;
  access_restricted: number;
  status: 'pending' | 'approved';
  created_at: string;
  updated_at: string;
}

interface GoogleJWKSKey {
  kid: string;
  n: string;
  e: string;
  kty: string;
  alg: string;
  use: string;
}

interface GoogleJWKS {
  keys: GoogleJWKSKey[];
}

export interface GooglePayload {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  exp: number;
  iat: number;
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifyGoogleJWT(token: string, clientId: string): Promise<GooglePayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(new TextDecoder().decode(base64urlDecode(headerB64)));

    const jwksRes = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    const jwks = await jwksRes.json() as GoogleJWKS;
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk as unknown as JsonWebKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sig = base64urlDecode(sigB64);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, sig, data);
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64))) as GooglePayload;

    const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) return null;
    if (payload.aud !== clientId) return null;
    if (payload.exp < Date.now() / 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser(request: Request, env: Env): Promise<MemberRow | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);

  const session = await env.DB.prepare(
    `SELECT s.user_id, m.* FROM sessions s
     JOIN members m ON m.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`,
  )
    .bind(token)
    .first<MemberRow>();

  return session ?? null;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function parseTechStack(raw: string | null): string[] {
  try {
    return JSON.parse(raw ?? '[]');
  } catch {
    return [];
  }
}
