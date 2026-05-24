'use client';
import { useEffect, useState } from 'react';
import type { BudgetWithSpend } from '../lib/types';
import { getCategoryEmoji, fmt, EXPENSE_CATEGORIES } from '../lib/types';

export default function BudgetManager() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = () => {
    setLoading(true);
    fetch(`/api/budgets?month=${month}&year=${year}`)
      .then(r => r.json())
      .then(data => { setBudgets(data); setLoading(false); });
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  async function deleteBudget(id: string) {
    if (!confirm('Delete this budget?')) return;
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    setBudgets(prev => prev.filter(b => b.id !== id));
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🎯 Budgets</h1>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setShowAdd(true)}>
          + Add
        </button>
      </div>

      {/* Month picker */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {months.map((m, i) => (
          <button key={m} onClick={() => setMonth(i + 1)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 999,
            border: `1.5px solid ${month === i + 1 ? 'var(--primary)' : 'var(--border)'}`,
            background: month === i + 1 ? 'rgba(0,120,90,0.15)' : 'var(--card)',
            color: month === i + 1 ? 'var(--primary)' : 'var(--text-m)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{m}</button>
        ))}
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #003D2E, #005740)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Total Budgeted</div>
              <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>{fmt(totalBudget)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Spent</div>
              <div style={{ color: totalSpent > totalBudget ? 'var(--expense)' : 'var(--income)', fontSize: '1.25rem', fontWeight: 800 }}>{fmt(totalSpent)}</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`, height: '100%', background: totalSpent > totalBudget ? 'var(--expense)' : 'var(--income)', borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-m)', padding: '2rem' }}>Loading…</div>
      ) : budgets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-m)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <p>No budgets set for {months[month - 1]}.</p>
          <p style={{ fontSize: '0.875rem', marginTop: 8 }}>Tap + Add to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {budgets.map(b => {
            const over = b.spent > b.limit_amount;
            const barColor = b.pct >= 100 ? 'var(--expense)' : b.pct >= 80 ? 'var(--gold)' : 'var(--primary)';
            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{getCategoryEmoji(b.category)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.category}</div>
                    <div style={{ color: 'var(--text-d)', fontSize: '0.75rem' }}>{months[month - 1]} {year}</div>
                  </div>
                  {over && <span style={{ fontSize: '0.7rem', color: 'var(--expense)', fontWeight: 700, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '2px 6px' }}>Over!</span>}
                  <button onClick={() => deleteBudget(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text-d)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                  <span style={{ color: over ? 'var(--expense)' : 'var(--text)', fontWeight: 600 }}>{fmt(b.spent)} spent</span>
                  <span style={{ color: 'var(--text-m)' }}>{fmt(b.limit_amount)} budget</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, b.pct)}%`, height: '100%', background: barColor, borderRadius: 6, transition: 'width 0.4s' }} />
                </div>
                <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.75rem', color: over ? 'var(--expense)' : 'var(--text-m)' }}>
                  {b.pct}% used · {over ? fmt(b.spent - b.limit_amount) + ' over' : fmt(b.limit_amount - b.spent) + ' left'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddBudgetModal month={month} year={year} onClose={() => setShowAdd(false)} onSaved={fetchBudgets} />}
    </div>
  );
}

function AddBudgetModal({ month, year, onClose, onSaved }: { month: number; year: number; onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!limit) return;
    setSaving(true);
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, limit_amount: parseFloat(limit), month, year }),
    });
    setSaving(false);
    onSaved(); onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Set Budget</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-m)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {EXPENSE_CATEGORIES.map(c => (
              <button key={c.name} onClick={() => setCategory(c.name)}
                style={{ padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${category === c.name ? 'var(--primary)' : 'var(--border)'}`, background: category === c.name ? 'rgba(0,120,90,0.18)' : 'var(--card2)', cursor: 'pointer', fontSize: 11, color: category === c.name ? 'var(--primary)' : 'var(--text-m)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Limit ($)</label>
          <input className="form-input" type="number" min="0" step="1" value={limit} onChange={e => setLimit(e.target.value)} placeholder="e.g. 500" />
        </div>
        <button className="btn btn-primary btn-block" onClick={save} disabled={saving || !limit}>
          {saving ? 'Saving…' : 'Set Budget'}
        </button>
      </div>
    </div>
  );
}
