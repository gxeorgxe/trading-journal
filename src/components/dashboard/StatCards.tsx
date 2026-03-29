import type { StatsResult } from '../../types'
import { formatR } from '../../utils/analytics'
import { GlassCard } from '../ui/GlassCard'

interface Props { stats: StatsResult }

function Card({ label, value, sub, color, gradient }: { label: string; value: string; sub?: string; color?: string; gradient?: boolean }) {
  return (
    <GlassCard hover padding="p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{label}</span>
        <span className={`text-2xl font-bold tabular-nums ${gradient ? 'text-gradient' : color ?? 'text-gray-100'}`}>{value}</span>
        {sub && <span className="text-xs text-gray-600">{sub}</span>}
      </div>
    </GlassCard>
  )
}

export function StatCards({ stats }: Props) {
  const { totalTrades, wins, losses, winRate, avgRWin, avgRLoss, expectancy, totalR, profitFactor, largestWin, largestLoss } = stats

  const rColor = (v: number) => v > 0 ? 'text-up' : v < 0 ? 'text-down' : 'text-gray-400'

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <Card label="Total Trades" value={String(totalTrades)} sub={`${wins}W / ${losses}L`} />
      <Card label="Win Rate" value={totalTrades ? `${(winRate * 100).toFixed(1)}%` : '—'} gradient={winRate >= 0.5} color={winRate > 0 ? 'text-warn' : 'text-gray-400'} />
      <Card label="Expectancy" value={totalTrades ? formatR(expectancy) : '—'} color={rColor(expectancy)} sub="per trade" />
      <Card label="Total R" value={totalTrades ? formatR(totalR) : '—'} gradient={totalR > 0} color={rColor(totalR)} />
      <Card label="Avg Win" value={avgRWin ? formatR(avgRWin) : '—'} color="text-up" />
      <Card label="Avg Loss" value={avgRLoss ? `${avgRLoss.toFixed(2)}R` : '—'} color="text-down" />
      <Card label="Profit Factor" value={totalTrades ? profitFactor.toFixed(2) : '—'} color={profitFactor >= 1.5 ? 'text-up' : profitFactor >= 1 ? 'text-warn' : 'text-down'} />
      <Card label="Best / Worst" value={totalTrades ? `${formatR(largestWin)}` : '—'} sub={totalTrades ? `Worst: ${largestLoss.toFixed(2)}R` : undefined} color="text-up" />
    </div>
  )
}
