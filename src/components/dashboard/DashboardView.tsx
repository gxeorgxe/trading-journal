import type { Playbook } from '../../types'
import type { UseFiltersReturn } from '../../hooks/useFilters'
import type { UseTradesReturn } from '../../hooks/useTrades'
import { FilterBar } from '../filters/FilterBar'
import { StatCards } from './StatCards'
import { StreakCards } from './StreakCards'
import { EquityCurve } from './EquityCurve'
import { DrawdownChart } from './DrawdownChart'
import { PairBarChart } from './PairBarChart'
import { SessionBarChart } from './SessionBarChart'
import { DayOfWeekChart } from './DayOfWeekChart'
import { DirectionComparison } from './DirectionComparison'
import { HourlyHeatmap } from './HourlyHeatmap'
import { MonthlyPnLTable } from './MonthlyPnLTable'
import { PlaybookDashboard } from './PlaybookDashboard'
import { CalendarHeatmap } from './CalendarHeatmap'
import {
  computeStats, buildEquityCurve, groupByPair, groupBySession,
  computeStreaks, buildDrawdownCurve, groupByDayOfWeek, buildHourlyHeatmap,
  buildMonthlyPnL, groupByDirection, computePlaybookStats,
} from '../../utils/analytics'

interface Props {
  tradeStore: UseTradesReturn
  filterStore: UseFiltersReturn
  playbooks: Playbook[]
}

export function DashboardView({ tradeStore, filterStore, playbooks }: Props) {
  const { trades, allTags, allPairs } = tradeStore
  const { filters, setFilter, clearFilters, filteredTrades, hasActiveFilters } = filterStore

  const stats = computeStats(filteredTrades)
  const streaks = computeStreaks(filteredTrades)
  const equityCurve = buildEquityCurve(filteredTrades)
  const drawdown = buildDrawdownCurve(filteredTrades)
  const byPair = groupByPair(filteredTrades)
  const bySession = groupBySession(filteredTrades)
  const byDow = groupByDayOfWeek(filteredTrades)
  const hourly = buildHourlyHeatmap(filteredTrades)
  const monthly = buildMonthlyPnL(filteredTrades)
  const byDirection = groupByDirection(filteredTrades)
  const pbStats = computePlaybookStats(filteredTrades, playbooks)

  const isEmpty = trades.length === 0

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-white/5 shrink-0">
        <h1 className="text-lg font-semibold text-gray-100">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {hasActiveFilters ? `Showing ${filteredTrades.length} filtered trades` : `${trades.length} total trades`}
        </p>
      </div>

      <FilterBar filters={filters} setFilter={setFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} allTags={allTags} allPairs={allPairs} playbooks={playbooks} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4 opacity-60">📊</div>
            <p className="text-gray-400 text-sm">Log trades in the Journal to see analytics here.</p>
          </div>
        ) : (
          <>
            <StatCards stats={stats} />
            <StreakCards streaks={streaks} />
            <EquityCurve data={equityCurve} />
            <DrawdownChart data={drawdown} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PairBarChart data={byPair} />
              <SessionBarChart data={bySession} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DayOfWeekChart data={byDow} />
              <DirectionComparison data={byDirection} />
            </div>
            <HourlyHeatmap data={hourly} />
            <MonthlyPnLTable data={monthly} />
            <PlaybookDashboard data={pbStats} />
            <CalendarHeatmap trades={filteredTrades} />
          </>
        )}
      </div>
    </div>
  )
}
