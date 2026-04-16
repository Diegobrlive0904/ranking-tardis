import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export async function supa(path, options = {}) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Variáveis do Supabase não configuradas');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || text || 'Supabase error');
  }

  return data;
}

export function signAdminToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || !ADMIN_TOKEN_SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = crypto
    .createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update(body)
    .digest('base64url');

  if (sig !== expected) return null;

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => {
        const idx = v.indexOf('=');
        return [v.slice(0, idx), v.slice(idx + 1)];
      })
  );
  return cookies[name];
}

export function requireAdmin(req) {
  const token = getCookie(req, 'tardis_admin');
  const payload = verifyAdminToken(token);
  return !!payload?.authenticated;
}
