import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const db = getDB(locals);
  await db.prepare('DELETE FROM transactions WHERE id = ?').bind(params.id).run();
  return new Response(JSON.stringify({ ok: true }));
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const db = getDB(locals);
  const body = await request.json() as any;
  const { amount, category, type, note, date, payment_method } = body;
  await db.prepare(
    'UPDATE transactions SET amount=?,category=?,type=?,note=?,date=?,payment_method=? WHERE id=?'
  ).bind(Number(amount), category, type, note || null, date, payment_method || 'Cash', params.id).run();
  return new Response(JSON.stringify({ ok: true }));
};
