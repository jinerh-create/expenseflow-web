'use client';
import { useEffect, useState } from 'react';
import type { Transaction, TxType } from '../lib/types';
import { getCategoryEmoji, fmt, fmtFull, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../lib/types';

type Filter = 'all' | 'income' | 'expense';

export default function TransactionList() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTxs = () => {
    setLoading(true);
    const q = filter !== 'all' ? `?type=${filter}` : '';
    fetch(`/api/transactions${q}`)
      .then(r => r.json())
      .then(data => { setTxs(data); setLoading(false); });
  };

  useEffect(() => { fetchTxs(); }, [filter]);

  async function deleteTx(id: string) {
    if (!confirm('Delete this transaction?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setTxs(prev => prev.filter(t => t.id !== id));
  }

  const totalIncome  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transactions</h1>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setShowAdd(true)}>
          + Add
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-m)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Income</div>
          <div style={{ color: 'var(--income)', fontSize: '1.125rem', fontWeight: 800 }}>{fmt(totalIncome)}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-m)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expenses</div>
          <div style={{ color: 'var(--expense)', fontSize: '1.125rem', fontWeight: 800 }}>{fmt(totalExpense)}</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {(['all', 'income', 'expense'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
            background: filter === f ? 'rgba(0,120,90,0.15)' : 'var(--card)',
            color: filter === f ? 'var(--primary)' : 'var(--text-m)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {f === 'all' ? 'All' : f === 'income' ? '↓ Income' : '↑ Expense'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-m)', padding: '3rem' }}>Loading…</div>
      ) : txs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-m)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No transactions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {txs.map(t => (
            <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: t.type === 'income' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {getCategoryEmoji(t.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.category}</div>
                <div style={{ color: 'var(--text-d)', fontSize: '0.75rem' }}>{t.note || t.payment_method} · {t.date}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: t.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: 800, fontSize: '0.9375rem' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
                <button onClick={() => deleteTx(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-d)', fontSize: '0.7rem', cursor: 'pointer', marginTop: 2 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={fetchTxs} />}
    </div>
  );
}

function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function save() {
    if (!amount || !category || !date) { setError('Fill all required fields'); return; }
    setSaving(true);
    const r = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), category, type, note, date, payment_method: paymentMethod }),
    });
    setSaving(false);
    if (r.ok) { onSaved(); onClose(); }
    else { const d = await r.json(); setError(d.error ?? 'Failed'); }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Add Transaction</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-m)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
          {(['expense', 'income'] as TxType[]).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory(t === 'expense' ? 'Food' : 'Salary'); }}
              style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${type === t ? (t === 'expense' ? 'var(--expense)' : 'var(--income)') : 'var(--border)'}`, background: type === t ? (t === 'expense' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)') : 'var(--card2)', color: type === t ? (t === 'expense' ? 'var(--expense)' : 'var(--income)') : 'var(--text-m)', fontWeight: 700, cursor: 'pointer' }}>
              {t === 'expense' ? '↑ Expense' : '↓ Income'}
            </button>
          ))}
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input className="form-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {categories.map(c => (
              <button key={c.name} onClick={() => setCategory(c.name)}
                style={{ padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${category === c.name ? 'var(--primary)' : 'var(--border)'}`, background: category === c.name ? 'rgba(0,120,90,0.18)' : 'var(--card2)', cursor: 'pointer', fontSize: 11, color: category === c.name ? 'var(--primary)' : 'var(--text-m)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment</label>
            <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Weekly groceries" />
        </div>

        <button className="btn btn-primary btn-block" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </div>
  );
}
