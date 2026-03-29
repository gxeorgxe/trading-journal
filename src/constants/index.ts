import type { FilterState } from '../types'

export const SESSIONS = ['London', 'NY', 'Asia'] as const
export const DIRECTIONS = ['Long', 'Short'] as const

export const DEFAULT_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'GBPJPY', 'EURJPY', 'EURGBP', 'XAUUSD', 'BTCUSD', 'NAS100', 'US30',
]

export const FILTER_DEFAULTS: FilterState = {
  dateFrom: '',
  dateTo: '',
  pairs: [],
  sessions: [],
  directions: [],
  tags: [],
  playbooks: [],
}

export const STORAGE_KEYS = {
  TRADES: 'tj_trades',
  TAGS: 'tj_tags',
  PLAYBOOKS: 'tj_playbooks',
  HABITS: 'tj_habits',
  HABIT_LOGS: 'tj_habit_logs',
  GOALS: 'tj_goals',
  TRANSACTIONS: 'tj_transactions',
} as const

export const STORAGE_WARN_BYTES = 4 * 1024 * 1024 // 4 MB

export const PLAYBOOK_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7',
] as const

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export const EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transport', 'Entertainment', 'Health',
  'Shopping', 'Bills', 'Education', 'Other',
] as const

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Trading', 'Investments', 'Other',
] as const
