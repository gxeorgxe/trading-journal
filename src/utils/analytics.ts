import type { Trade, StatsResult, EquityPoint, GroupedStat, DayCell, StreakInfo, DrawdownPoint, DayOfWeekStat, HourlyCell, MonthlyRow, DirectionStat, PlaybookStat, Playbook } from '../types'
import { getDaysInMonth, format, parseISO, getDay } from 'date-fns'
import { DAYS_OF_WEEK } from '../constants'

export function computeStats(trades: Trade[]): StatsResult {
  if (trades.length === 0) {
    return {
      totalTrades: 0, wins: 0, losses: 0, breakeven: 0,
      winRate: 0, avgRWin: 0, avgRLoss: 0, expectancy: 0,
      totalR: 0, profitFactor: 0, largestWin: 0, largestLoss: 0,
    }
  }
  const wins = trades.filter(t => t.r > 0)
  const losses = trades.filter(t => t.r < 0)
  const breakeven = trades.filter(t => t.r === 0).length

  const totalR = trades.reduce((s, t) => s + t.r, 0)
  const grossWin = wins.reduce((s, t) => s + t.r, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.r, 0))

  const winRate = wins.length / trades.length
  const avgRWin = wins.length ? grossWin / wins.length : 0
  const avgRLoss = losses.length ? grossLoss / losses.length : 0
  const expectancy = winRate * avgRWin - (1 - winRate) * avgRLoss
  const profitFactor = grossLoss === 0 ? grossWin : grossWin / grossLoss
  const largestWin = wins.length ? Math.max(...wins.map(t => t.r)) : 0
  const largestLoss = losses.length ? Math.abs(Math.min(...losses.map(t => t.r))) : 0

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven,
    winRate,
    avgRWin,
    avgRLoss,
    expectancy,
    totalR,
    profitFactor,
    largestWin,
    largestLoss,
  }
}

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort((a, b) => {
    const d = a.date.localeCompare(b.date)
    return d !== 0 ? d : a.entryTime.localeCompare(b.entryTime)
  })
  let cumR = 0
  return sorted.map((t, i) => {
    cumR = Math.round((cumR + t.r) * 1000) / 1000
    return { date: t.date, cumR, tradeIndex: i + 1 }
  })
}

export function groupByPair(trades: Trade[]): GroupedStat[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const arr = map.get(t.pair) ?? []
    arr.push(t)
    map.set(t.pair, arr)
  }
  return Array.from(map.entries()).map(([pair, ts]) => toGroupedStat(pair, ts))
    .sort((a, b) => b.totalR - a.totalR)
}

export function groupBySession(trades: Trade[]): GroupedStat[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const arr = map.get(t.session) ?? []
    arr.push(t)
    map.set(t.session, arr)
  }
  return Array.from(map.entries()).map(([session, ts]) => toGroupedStat(session, ts))
}

function toGroupedStat(label: string, ts: Trade[]): GroupedStat {
  const wins = ts.filter(t => t.r > 0).length
  const losses = ts.filter(t => t.r < 0).length
  return {
    label,
    totalR: Math.round(ts.reduce((s, t) => s + t.r, 0) * 1000) / 1000,
    wins,
    losses,
    count: ts.length,
    winRate: ts.length ? wins / ts.length : 0,
  }
}

export function buildCalendarData(trades: Trade[], year: number, month: number): DayCell[] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1))
  const cells: DayCell[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = format(new Date(year, month - 1, d), 'yyyy-MM-dd')
    const dayTrades = trades.filter(t => t.date === date)
    cells.push({
      date,
      tradeCount: dayTrades.length,
      totalR: dayTrades.length ? Math.round(dayTrades.reduce((s, t) => s + t.r, 0) * 1000) / 1000 : null,
    })
  }
  return cells
}

export function formatR(r: number): string {
  return `${r > 0 ? '+' : ''}${r.toFixed(2)}R`
}

// Get first day-of-week offset for a month (Monday=0)
export function getMonthStartOffset(year: number, month: number): number {
  const day = parseISO(`${year}-${String(month).padStart(2, '0')}-01`).getDay()
  return (day + 6) % 7 // Mon=0 ... Sun=6
}

export function computeStreaks(trades: Trade[]): StreakInfo {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime))
  let current = 0, bestWin = 0, worstLoss = 0, streak = 0
  for (const t of sorted) {
    if (t.r > 0) streak = streak > 0 ? streak + 1 : 1
    else if (t.r < 0) streak = streak < 0 ? streak - 1 : -1
    else streak = 0
    if (streak > bestWin) bestWin = streak
    if (streak < worstLoss) worstLoss = streak
    current = streak
  }
  return { currentStreak: current, bestWinStreak: bestWin, worstLossStreak: Math.abs(worstLoss) }
}

export function buildDrawdownCurve(trades: Trade[]): DrawdownPoint[] {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime))
  let cumR = 0, peak = 0
  return sorted.map((t, i) => {
    cumR = Math.round((cumR + t.r) * 1000) / 1000
    if (cumR > peak) peak = cumR
    return { date: t.date, cumR, peak, drawdown: Math.round((cumR - peak) * 1000) / 1000, tradeIndex: i + 1 }
  })
}

export function groupByDayOfWeek(trades: Trade[]): DayOfWeekStat[] {
  const groups: Trade[][] = Array.from({ length: 7 }, () => [])
  for (const t of trades) {
    const d = getDay(parseISO(t.date))
    const idx = (d + 6) % 7 // Mon=0
    groups[idx].push(t)
  }
  return groups.map((ts, i) => ({
    day: DAYS_OF_WEEK[i],
    avgR: ts.length ? Math.round(ts.reduce((s, t) => s + t.r, 0) / ts.length * 1000) / 1000 : 0,
    count: ts.length,
    winRate: ts.length ? ts.filter(t => t.r > 0).length / ts.length : 0,
  }))
}

export function buildHourlyHeatmap(trades: Trade[]): HourlyCell[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    if (!t.entryTime) continue
    const hour = parseInt(t.entryTime.split(':')[0])
    const dow = (getDay(parseISO(t.date)) + 6) % 7
    const key = `${hour}-${dow}`
    const arr = map.get(key) ?? []
    arr.push(t)
    map.set(key, arr)
  }
  return Array.from(map.entries()).map(([key, ts]) => {
    const [h, d] = key.split('-').map(Number)
    return {
      hour: h,
      dayOfWeek: d,
      avgR: Math.round(ts.reduce((s, t) => s + t.r, 0) / ts.length * 1000) / 1000,
      count: ts.length,
    }
  })
}

export function buildMonthlyPnL(trades: Trade[]): MonthlyRow[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const m = t.date.slice(0, 7)
    const arr = map.get(m) ?? []
    arr.push(t)
    map.set(m, arr)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ts]) => {
      const totalR = Math.round(ts.reduce((s, t) => s + t.r, 0) * 1000) / 1000
      const wins = ts.filter(t => t.r > 0).length
      return {
        month,
        label: format(parseISO(month + '-01'), 'MMM yyyy'),
        tradeCount: ts.length,
        winRate: ts.length ? wins / ts.length : 0,
        totalR,
        avgR: ts.length ? Math.round(totalR / ts.length * 1000) / 1000 : 0,
      }
    })
}

export function groupByDirection(trades: Trade[]): DirectionStat[] {
  const dirs: ('Long' | 'Short')[] = ['Long', 'Short']
  return dirs.map(direction => {
    const ts = trades.filter(t => t.direction === direction)
    const wins = ts.filter(t => t.r > 0)
    const losses = ts.filter(t => t.r < 0)
    const totalR = Math.round(ts.reduce((s, t) => s + t.r, 0) * 1000) / 1000
    const wr = ts.length ? wins.length / ts.length : 0
    const avgW = wins.length ? wins.reduce((s, t) => s + t.r, 0) / wins.length : 0
    const avgL = losses.length ? Math.abs(losses.reduce((s, t) => s + t.r, 0)) / losses.length : 0
    return {
      direction,
      count: ts.length,
      winRate: wr,
      totalR,
      avgR: ts.length ? Math.round(totalR / ts.length * 1000) / 1000 : 0,
      expectancy: Math.round((wr * avgW - (1 - wr) * avgL) * 1000) / 1000,
    }
  }).filter(d => d.count > 0)
}

export function computePlaybookStats(trades: Trade[], playbooks: Playbook[]): PlaybookStat[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    if (!t.playbookGrade) continue
    const arr = map.get(t.playbookGrade.playbookId) ?? []
    arr.push(t)
    map.set(t.playbookGrade.playbookId, arr)
  }
  return Array.from(map.entries()).map(([pbId, ts]) => {
    const pb = playbooks.find(p => p.id === pbId)
    const wins = ts.filter(t => t.r > 0).length
    const adherences = ts.map(t => {
      const g = t.playbookGrade!
      return g.rulesFollowed.length ? g.rulesFollowed.filter(Boolean).length / g.rulesFollowed.length : 0
    })
    return {
      playbookId: pbId,
      playbookName: pb?.name ?? 'Deleted',
      color: pb?.color ?? '#6b7280',
      count: ts.length,
      winRate: ts.length ? wins / ts.length : 0,
      totalR: Math.round(ts.reduce((s, t) => s + t.r, 0) * 1000) / 1000,
      avgAdherence: adherences.length ? Math.round(adherences.reduce((s, a) => s + a, 0) / adherences.length * 1000) / 1000 : 0,
    }
  })
}
