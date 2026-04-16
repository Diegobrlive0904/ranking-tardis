import { json, parseBody, requireAdmin, supa } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido' });
  if (!requireAdmin(req)) return json(res, 401, { error: 'Não autorizado' });

  const { challengeId, winnerName } = await parseBody(req);
  if (!challengeId || !winnerName) return json(res, 400, { error: 'Dados inválidos' });

  try {
    await supa(`challenges?id=eq.${challengeId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        is_completed: true,
        winner_name: winnerName
      })
    });

    return json(res, 200, { success: true });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
