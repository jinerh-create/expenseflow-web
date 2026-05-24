import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  const db = getDB(locals);
  const month = Number(url.searchParams.get('month') ?? new Date().getMonth() + 1);
  const year  = Number(url.searchParams.get('year')  ?? new Date().getFullYear());
  const monthStr = `${year}-${String(month).padStart(2,'0')}`;

  const { results: budgets } = await db.prepare(
    'SELECT * FROM budgets WHERE month=? AND year=?'
  ).bind(month, year).all();

  const { results: spends } = await db.prepare(
    `SELECT category, SUM(amount) AS spent FROM transactions
     WHERE type='expense' AND date LIKE ? GROUP BY category`
  ).bind(`${monthStr}%`).all<{ category: string; spent: number }>();

  const spendMap = Object.fromEntries(spends.map(s => [s.category, s.spent]));
  const result = (budgets as any[]).map(b => ({
    ...b,
    spent: spendMap[b.category] ?? 0,
    pct: Math.min(100, Math.round(((spendMap[b.category] ?? 0) / b.limit_amount) * 100)),
  }));

  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const db = getDB(locals);
  const body = await request.json() as any;
  const { category, limit_amount, month, year } = body;
  if (!category || !limit_amount) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  const id = crypto.randomUUID();
  await db.prepare(
    'INSERT OR REPLACE INTO budgets (id,category,limit_amount,month,year) VALUES (?,?,?,?,?)'
  ).bind(id, category, Number(limit_amount), month, year).run();
  return new Response(JSON.stringify({ ok: true, id }), { status: 201 });
};
