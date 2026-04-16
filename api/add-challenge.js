import { json, parseBody, requireAdmin, supa } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido' });
  if (!requireAdmin(req)) return json(res, 401, { error: 'Não autorizado' });

  const { text, challengeDate } = await parseBody(req);
  if (!text || !challengeDate) return json(res, 400, { error: 'Dados inválidos' });

  try {
    await supa('challenges', {
      method: 'POST',
      body: JSON.stringify([{
        text,
        challenge_date: challengeDate,
        is_completed: false
      }])
    });

    return json(res, 200, { success: true });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
