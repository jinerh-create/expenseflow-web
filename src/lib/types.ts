export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TxType;
  note: string | null;
  date: string;
  payment_method: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  month: number;
  year: number;
}

export interface BudgetWithSpend extends Budget {
  spent: number;
  pct: number;
}

export interface Stats {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
  savingsPct: number;
  last7Days: number[];          // index 0 = 6 days ago, 6 = today
  last7Labels: string[];        // e.g. ['Mon','Tue',...]
  categorySpend: { category: string; amount: number; pct: number }[];
  recentTransactions: Transaction[];
}

export const EXPENSE_CATEGORIES = [
  { name: 'Food',          emoji: '🍔' },
  { name: 'Transport',     emoji: '🚗' },
  { name: 'Shopping',      emoji: '🛍️' },
  { name: 'Bills',         emoji: '⚡' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Health',        emoji: '🏥' },
  { name: 'Travel',        emoji: '✈️' },
  { name: 'Education',     emoji: '📚' },
  { name: 'Fuel',          emoji: '⛽' },
  { name: 'Other',         emoji: '📦' },
] as const;

export const INCOME_CATEGORIES = [
  { name: 'Salary',     emoji: '💰' },
  { name: 'Business',   emoji: '💼' },
  { name: 'Investment', emoji: '📈' },
  { name: 'Freelance',  emoji: '💻' },
  { name: 'Gift',       emoji: '🎁' },
  { name: 'Other',      emoji: '💵' },
] as const;

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryEmoji(name: string): string {
  return ALL_CATEGORIES.find(c => c.name === name)?.emoji ?? '📦';
}

export const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Mobile Pay'];

export function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function fmtFull(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
