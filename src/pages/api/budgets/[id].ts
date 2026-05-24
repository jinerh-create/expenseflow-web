import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const db = getDB(locals);
  await db.prepare('DELETE FROM budgets WHERE id = ?').bind(params.id).run();
  return new Response(JSON.stringify({ ok: true }));
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const db = getDB(locals);
  const { limit_amount } = await request.json() as any;
  await db.prepare('UPDATE budgets SET limit_amount=? WHERE id=?').bind(Number(limit_amount), params.id).run();
  return new Response(JSON.stringify({ ok: true }));
};
