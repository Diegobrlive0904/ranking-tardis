import { json, parseBody, requireAdmin, supa } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido' });
  if (!requireAdmin(req)) return json(res, 401, { error: 'Não autorizado' });

  const { teamId, index } = await parseBody(req);
  if (!teamId || typeof index !== 'number') {
    return json(res, 400, { error: 'Dados inválidos' });
  }

  try {
    const rows = await supa(`teams?id=eq.${teamId}&select=*`);
    const team = rows?.[0];
    if (!team) return json(res, 404, { error: 'Equipe não encontrada' });

    const history = Array.isArray(team.history) ? [...team.history] : [];
    if (!history[index]) return json(res, 404, { error: 'Registro não encontrado' });

    const removed = history[index];
    history.splice(index, 1);

    await supa(`teams?id=eq.${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        score: (team.score || 0) - Number(removed.pts || 0),
        history
      })
    });

    return json(res, 200, { success: true });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
