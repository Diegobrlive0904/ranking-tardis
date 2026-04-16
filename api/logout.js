import { json } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    'tardis_admin=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0'
  );
  return json(res, 200, { success: true });
}
