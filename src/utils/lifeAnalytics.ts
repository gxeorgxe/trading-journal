import type { HabitLog, Transaction, TransactionType } from '../types'
import { format, parseISO, subDays, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns'

export function computeHabitStreak(logs: HabitLog[], habitId: string): { current: number; best: number } {
  const dates = logs
    .filter(l => l.habitId === habitId)
    .map(l => l.date)
    .sort()

  if (!dates.length) return { current: 0, best: 0 }

  const dateSet = new Set(dates)
  let current = 0
  let d = new Date()
  // Check today and count backwards
  while (dateSet.has(format(d, 'yyyy-MM-dd'))) {
    current++
    d = subDays(d, 1)
  }
  // If today isn't done yet, check from yesterday
  if (current === 0) {
    d = subDays(new Date(), 1)
    while (dateSet.has(format(d, 'yyyy-MM-dd'))) {
      current++
      d = subDays(d, 1)
    }
  }

  // Best streak
  let best = 0
  let streak = 1
  const sorted = [...new Set(dates)].sort()
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1])
    const curr = parseISO(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) {
      streak++
    } else {
      best = Math.max(best, streak)
      streak = 1
    }
  }
  best = Math.max(best, streak)

  return { current, best }
}

export function computeCompletionRate(logs: HabitLog[], habitId: string, days: number): number {
  const doneDates = new Set(
    logs.filter(l => l.habitId === habitId).map(l => l.date)
  )
  let count = 0
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (doneDates.has(d)) count++
  }
  return days > 0 ? Math.round(count / days * 100) : 0
}

export function buildHabitCalendarData(
  logs: HabitLog[],
  habitId: string,
  year: number,
  month: number
): { date: string; done: boolean }[] {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(start)
  const days = eachDayOfInterval({ start, end })
  const doneDates = new Set(
    logs.filter(l => l.habitId === habitId).map(l => l.date)
  )
  return days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    return { date: dateStr, done: doneDates.has(dateStr) }
  })
}

export interface MonthlyBreakdown {
  totalIncome: number
  totalExpenses: number
  net: number
  byCategory: { category: string; amount: number }[]
}

export function computeMonthlyBreakdown(transactions: Transaction[], yearMonth: string): MonthlyBreakdown {
  const filtered = transactions.filter(t => t.date.startsWith(yearMonth))
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const catMap = new Map<string, number>()
  for (const t of filtered.filter(t => t.type === 'expense')) {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount)
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return { totalIncome, totalExpenses, net: totalIncome - totalExpenses, byCategory }
}

export function computeMonthlyTrend(transactions: Transaction[]): { month: string; label: string; income: number; expenses: number }[] {
  const map = new Map<string, { income: number; expenses: number }>()
  for (const t of transactions) {
    const m = t.date.slice(0, 7)
    const entry = map.get(m) ?? { income: 0, expenses: 0 }
    if (t.type === 'income') entry.income += t.amount
    else entry.expenses += t.amount
    map.set(m, entry)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const d = parseISO(month + '-01')
      return {
        month,
        label: isValid(d) ? format(d, 'MMM yy') : month,
        ...data,
      }
    })
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  type: TransactionType,
  yearMonth?: string
): { category: string; amount: number; percentage: number }[] {
  let filtered = transactions.filter(t => t.type === type)
  if (yearMonth) filtered = filtered.filter(t => t.date.startsWith(yearMonth))

  const catMap = new Map<string, number>()
  for (const t of filtered) {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount)
  }
  const total = filtered.reduce((s, t) => s + t.amount, 0)
  return Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round(amount / total * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}
