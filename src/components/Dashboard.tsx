'use client';
import { useEffect, useState } from 'react';
import type { Stats } from '../lib/types';
import { getCategoryEmoji, fmt, fmtFull } from '../lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-m)' }}>Loading…</div>
  );

  const maxBar = Math.max(...stats.last7Days, 1);

  return (
    <div style={{ padding: '1rem 1rem 0' }}>
      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #003D2E 0%, #005740 50%, #00785A 100%)',
        borderRadius: 20, padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,120,90,0.25)',
        marginBottom: '1rem',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 4 }}>Total Balance</div>
        <div style={{ color: '#fff', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '1.25rem' }}>
          {fmtFull(stats.totalBalance)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <BalChip label="↓ Income" value={fmt(stats.monthIncome)} color="var(--income)" />
          <BalChip label="↑ Expenses" value={fmt(stats.monthExpense)} color="var(--expense)" />
        </div>
      </div>

      {/* Savings */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: 28 }}>💰</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-m)', fontSize: '0.75rem', fontWeight: 500 }}>Monthly Savings</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: stats.monthSavings >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {fmtFull(stats.monthSavings)}
          </div>
        </div>
        {stats.monthIncome > 0 && (
          <div style={{
            padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
            background: stats.monthSavings >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: stats.monthSavings >= 0 ? 'var(--income)' : 'var(--expense)',
          }}>
            {stats.savingsPct}% saved
          </div>
        )}
      </div>

      {/* Last 7 days bar chart */}
      <div className="section-title">Last 7 Days</div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, paddingBottom: 24, position: 'relative' }}>
          {stats.last7Days.map((val, i) => {
            const h = maxBar > 0 ? (val / maxBar) * 96 : 0;
            const isToday = i === 6;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-m)', marginBottom: 2 }}>
                  {val > 0 ? fmt(val) : ''}
                </div>
                <div style={{
                  width: '100%', height: `${Math.max(h, 4)}px`,
                  background: isToday ? 'var(--primary)' : 'rgba(239,68,68,0.55)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: '0.625rem', color: 'var(--text-d)', marginTop: 4 }}>{stats.last7Labels[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      {stats.categorySpend.length > 0 && (
        <>
          <div className="section-title">This Month by Category</div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            {stats.categorySpend.map(c => (
              <div key={c.category} style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 18 }}>{getCategoryEmoji(c.category)}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>{c.category}</span>
                  <span style={{ color: 'var(--expense)', fontWeight: 700, fontSize: '0.875rem' }}>{fmt(c.amount)}</span>
                  <span style={{ color: 'var(--text-d)', fontSize: '0.75rem', width: 30, textAlign: 'right' }}>{c.pct}%</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: 'var(--expense)', borderRadius: 4, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent transactions */}
      <div className="section-title">Recent</div>
      {stats.recentTransactions.map(t => (
        <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', padding: '0.875rem 1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: t.type === 'income' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {getCategoryEmoji(t.category)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.category}</div>
            <div style={{ color: 'var(--text-d)', fontSize: '0.75rem' }}>{t.note || t.payment_method} · {t.date}</div>
          </div>
          <div style={{ color: t.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: 800, fontSize: '0.9375rem', flexShrink: 0 }}>
            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
          </div>
        </div>
      ))}
      <a href="/transactions" style={{ display: 'block', textAlign: 'center', color: 'var(--primary)', fontSize: '0.875rem', padding: '1rem 0' }}>
        View all transactions →
      </a>
    </div>
  );
}

function BalChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem' }}>
      <div style={{ color: `${color}cc`, fontSize: '0.6875rem', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color, fontSize: '0.9375rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}
