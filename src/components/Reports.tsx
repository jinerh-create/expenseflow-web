'use client';
import { useEffect, useState } from 'react';
import type { Transaction } from '../lib/types';
import { getCategoryEmoji, fmt } from '../lib/types';

interface MonthSummary { month: string; income: number; expense: number; savings: number; }

export default function Reports() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions').then(r => r.json()).then(data => { setTxs(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-m)' }}>Loading…</div>;

  // Monthly summaries
  const monthMap: Record<string, { income: number; expense: number }> = {};
  txs.forEach(t => {
    const m = t.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 };
    if (t.type === 'income') monthMap[m].income += t.amount;
    else monthMap[m].expense += t.amount;
  });
  const months: MonthSummary[] = Object.entries(monthMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([month, v]) => ({ month, ...v, savings: v.income - v.expense }));

  // All-time category spend
  const catMap: Record<string, number> = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
  });
  const catList = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const catTotal = catList.reduce((s, [, v]) => s + v, 0) || 1;

  // Payment method breakdown
  const pmMap: Record<string, number> = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    pmMap[t.payment_method] = (pmMap[t.payment_method] ?? 0) + t.amount;
  });
  const pmList = Object.entries(pmMap).sort((a, b) => b[1] - a[1]);

  const maxBar = Math.max(...months.map(m => Math.max(m.income, m.expense)), 1);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>📊 Reports</h1>

      {/* Monthly income vs expense bars */}
      <div className="section-title">Monthly Overview</div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        {months.length === 0 ? (
          <div style={{ color: 'var(--text-m)', textAlign: 'center' }}>No data yet</div>
        ) : months.map(m => (
          <div key={m.month} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-m)', fontWeight: 600 }}>
                {new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <span style={{ color: m.savings >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 700 }}>
                {m.savings >= 0 ? '+' : ''}{fmt(m.savings)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--income)', width: 42, textAlign: 'right' }}>{fmt(m.income)}</span>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: 3, height: 6 }}>
                  <div style={{ width: `${(m.income / maxBar) * 100}%`, height: '100%', background: 'var(--income)', borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--expense)', width: 42, textAlign: 'right' }}>{fmt(m.expense)}</span>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: 3, height: 6 }}>
                  <div style={{ width: `${(m.expense / maxBar) * 100}%`, height: '100%', background: 'var(--expense)', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {catList.length > 0 && (
        <>
          <div className="section-title">All-Time Spending by Category</div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            {catList.map(([cat, amt]) => {
              const pct = Math.round((amt / catTotal) * 100);
              return (
                <div key={cat} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 18 }}>{getCategoryEmoji(cat)}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>{cat}</span>
                    <span style={{ color: 'var(--expense)', fontWeight: 700, fontSize: '0.875rem' }}>{fmt(amt)}</span>
                    <span style={{ color: 'var(--text-d)', fontSize: '0.75rem', width: 30, textAlign: 'right' }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 5 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--expense)', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Payment methods */}
      {pmList.length > 0 && (
        <>
          <div className="section-title">Payment Methods</div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            {pmList.map(([pm, amt]) => (
              <div key={pm} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pm}</span>
                <span style={{ color: 'var(--expense)', fontWeight: 700 }}>{fmt(amt)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
