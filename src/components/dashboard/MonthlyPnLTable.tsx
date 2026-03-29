import type { MonthlyRow } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { formatR } from '../../utils/analytics'

interface Props { data: MonthlyRow[] }

export function MonthlyPnLTable({ data }: Props) {
  if (data.length === 0) return null

  const totalTrades = data.reduce((s, r) => s + r.tradeCount, 0)
  const totalR = Math.round(data.reduce((s, r) => s + r.totalR, 0) * 1000) / 1000
  const totalWins = data.reduce((s, r) => s + Math.round(r.winRate * r.tradeCount), 0)
  const overallWR = totalTrades ? totalWins / totalTrades : 0

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly P&L</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Month</th>
              <th className="text-right py-2 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Trades</th>
              <th className="text-right py-2 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Win Rate</th>
              <th className="text-right py-2 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Total R</th>
              <th className="text-right py-2 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Avg R</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.month} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                <td className="py-2 px-3 text-gray-300 font-medium">{row.label}</td>
                <td className="py-2 px-3 text-gray-400 text-right tabular-nums">{row.tradeCount}</td>
                <td className={`py-2 px-3 text-right tabular-nums ${row.winRate >= 0.5 ? 'text-up' : 'text-down'}`}>{(row.winRate * 100).toFixed(0)}%</td>
                <td className={`py-2 px-3 text-right font-semibold tabular-nums ${row.totalR > 0 ? 'text-up' : row.totalR < 0 ? 'text-down' : 'text-gray-400'}`}>{formatR(row.totalR)}</td>
                <td className={`py-2 px-3 text-right tabular-nums ${row.avgR > 0 ? 'text-up' : row.avgR < 0 ? 'text-down' : 'text-gray-400'}`}>{formatR(row.avgR)}</td>
              </tr>
            ))}
            <tr className="bg-white/[0.04] font-semibold">
              <td className="py-2.5 px-3 text-gray-200">Total</td>
              <td className="py-2.5 px-3 text-gray-200 text-right tabular-nums">{totalTrades}</td>
              <td className={`py-2.5 px-3 text-right tabular-nums ${overallWR >= 0.5 ? 'text-up' : 'text-down'}`}>{(overallWR * 100).toFixed(0)}%</td>
              <td className={`py-2.5 px-3 text-right tabular-nums ${totalR > 0 ? 'text-up' : totalR < 0 ? 'text-down' : 'text-gray-400'}`}>{formatR(totalR)}</td>
              <td className="py-2.5 px-3 text-right tabular-nums text-gray-400">{totalTrades ? formatR(Math.round(totalR / totalTrades * 1000) / 1000) : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
