import type { APIRoute } from 'astro';
import { getDB, getTransactions } from '../../../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  const db = getDB(locals);
  const type = url.searchParams.get('type');
  const month = url.searchParams.get('month');

  let query = 'SELECT * FROM transactions';
  const conditions: string[] = [];
  const params: string[] = [];

  if (type) { conditions.push("type = ?"); params.push(type); }
  if (month) { conditions.push("date LIKE ?"); params.push(`${month}%`); }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY date DESC, created_at DESC LIMIT 200';

  const { results } = await db.prepare(query).bind(...params).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const db = getDB(locals);
  const body = await request.json() as any;
  const { amount, category, type, note, date, payment_method } = body;
  if (!amount || !category || !type || !date) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  const id = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO transactions (id,amount,category,type,note,date,payment_method) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, Number(amount), category, type, note || null, date, payment_method || 'Cash').run();
  return new Response(JSON.stringify({ ok: true, id }), { status: 201 });
};
