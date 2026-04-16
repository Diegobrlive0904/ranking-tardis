import { json, parseBody, signAdminToken } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido' });

  const { user, pass } = await parseBody(req);

  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASSWORD
  ) {
    const token = signAdminToken({ authenticated: true, user, iat: Date.now() });
    res.setHeader(
      'Set-Cookie',
      `tardis_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=28800`
    );
    return json(res, 200, { success: true });
  }

  return json(res, 401, { success: false, error: 'Credenciais inválidas' });
}
