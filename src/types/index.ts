export interface Trade {
  id: string
  date: string        // "YYYY-MM-DD"
  pair: string
  entryTime: string   // "HH:MM"
  r: number           // positive = win, negative = loss
  direction: 'Long' | 'Short'
  session: 'London' | 'NY' | 'Asia'
  tags: string[]
  notes: string
  screenshots: string[] // base64 data URLs
  playbookGrade?: PlaybookGrade
  createdAt: string
  updatedAt: string
}

export type TradeDraft = Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>

export interface Playbook {
  id: string
  name: string
  rules: string[]
  color: string
  createdAt: string
  updatedAt: string
}

export type PlaybookDraft = Omit<Playbook, 'id' | 'createdAt' | 'updatedAt'>

export interface PlaybookGrade {
  playbookId: string
  rulesFollowed: boolean[]
}

export interface FilterState {
  dateFrom: string
  dateTo: string
  pairs: string[]
  sessions: string[]
  directions: string[]
  tags: string[]
  playbooks: string[]
}

export interface StatsResult {
  totalTrades: number
  wins: number
  losses: number
  breakeven: number
  winRate: number
  avgRWin: number
  avgRLoss: number
  expectancy: number
  totalR: number
  profitFactor: number
  largestWin: number
  largestLoss: number
}

export interface EquityPoint {
  date: string
  cumR: number
  tradeIndex: number
}

export interface GroupedStat {
  label: string
  totalR: number
  wins: number
  losses: number
  count: number
  winRate: number
}

export interface DayCell {
  date: string
  totalR: number | null
  tradeCount: number
}

export interface StreakInfo {
  currentStreak: number
  bestWinStreak: number
  worstLossStreak: number
}

export interface DrawdownPoint {
  date: string
  cumR: number
  peak: number
  drawdown: number
  tradeIndex: number
}

export interface DayOfWeekStat {
  day: string
  avgR: number
  count: number
  winRate: number
}

export interface HourlyCell {
  hour: number
  dayOfWeek: number
  avgR: number
  count: number
}

export interface MonthlyRow {
  month: string
  label: string
  tradeCount: number
  winRate: number
  totalR: number
  avgR: number
}

export interface DirectionStat {
  direction: 'Long' | 'Short'
  count: number
  winRate: number
  totalR: number
  avgR: number
  expectancy: number
}

export interface PlaybookStat {
  playbookId: string
  playbookName: string
  color: string
  count: number
  winRate: number
  totalR: number
  avgAdherence: number
}

export type SortField = 'date' | 'pair' | 'r' | 'direction' | 'session' | 'entryTime'
export type SortDir = 'asc' | 'desc'

// ── Life Dashboard ──

export interface Habit {
  id: string
  name: string
  color: string
  targetFrequency?: number // days per week target
  createdAt: string
  updatedAt: string
}

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>

export interface HabitLog {
  id: string
  habitId: string
  date: string // "YYYY-MM-DD"
  done: boolean
  createdAt: string
}

export type GoalStatus = 'active' | 'completed' | 'abandoned'

export interface Milestone {
  id: string
  label: string
  done: boolean
}

export interface Goal {
  id: string
  name: string
  description: string
  targetDate: string // "YYYY-MM-DD"
  color: string
  status: GoalStatus
  progress: number // 0-100
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}

export type GoalDraft = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  date: string // "YYYY-MM-DD"
  notes: string
  createdAt: string
  updatedAt: string
}

export type TransactionDraft = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
