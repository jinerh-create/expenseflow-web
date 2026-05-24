import type { D1Database } from '@cloudflare/workers-types';
import type { Transaction, Budget, Stats } from './types';

export function getDB(locals: App.Locals): D1Database {
  return (locals as any).runtime?.env?.DB ?? (locals as any).DB;
}

export async function getTransactions(db: D1Database): Promise<Transaction[]> {
  const { results } = await db.prepare(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT 200'
  ).all<Transaction>();
  return results;
}

export async function getTransaction(db: D1Database, id: string): Promise<Transaction | null> {
  return db.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first<Transaction>();
}

export async function getBudgets(db: D1Database, month: number, year: number): Promise<Budget[]> {
  const { results } = await db.prepare(
    'SELECT * FROM budgets WHERE month = ? AND year = ?'
  ).bind(month, year).all<Budget>();
  return results;
}

export async function getStats(db: D1Database): Promise<Stats> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${y}-${m}`;

  // Total balance
  const balRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) -
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS balance
     FROM transactions`
  ).first<{ balance: number }>();

  // Month income + expense
  const monthRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions WHERE date LIKE ?`
  ).bind(`${monthPrefix}%`).first<{ income: number; expense: number }>();

  const monthIncome  = monthRow?.income  ?? 0;
  const monthExpense = monthRow?.expense ?? 0;
  const monthSavings = monthIncome - monthExpense;
  const savingsPct   = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0;

  // Last 7 days expenses
  const last7: number[] = [];
  const last7Labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    last7Labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    const row = await db.prepare(
      `SELECT SUM(amount) AS total FROM transactions WHERE type='expense' AND date = ?`
    ).bind(ds).first<{ total: number }>();
    last7.push(row?.total ?? 0);
  }

  // Category spend this month (expenses)
  const { results: catRows } = await db.prepare(
    `SELECT category, SUM(amount) AS total FROM transactions
     WHERE type='expense' AND date LIKE ?
     GROUP BY category ORDER BY total DESC LIMIT 6`
  ).bind(`${monthPrefix}%`).all<{ category: string; total: number }>();

  const catTotal = catRows.reduce((s, r) => s + r.total, 0) || 1;
  const categorySpend = catRows.map(r => ({
    category: r.category,
    amount: r.total,
    pct: Math.round((r.total / catTotal) * 100),
  }));

  // Recent transactions
  const { results: recent } = await db.prepare(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT 5'
  ).all<Transaction>();

  return {
    totalBalance: balRow?.balance ?? 0,
    monthIncome,
    monthExpense,
    monthSavings,
    savingsPct,
    last7,
    last7Labels,
    categorySpend,
    recentTransactions: recent,
  };
}
