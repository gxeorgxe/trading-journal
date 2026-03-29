import type { DirectionStat } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { formatR } from '../../utils/analytics'

interface Props { data: DirectionStat[] }

export function DirectionComparison({ data }: Props) {
  if (data.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map(d => (
        <GlassCard key={d.direction} padding="p-0" className="overflow-hidden">
          <div className={`h-1 ${d.direction === 'Long' ? 'bg-up' : 'bg-down'}`} />
          <div className="p-4">
            <h4 className={`text-sm font-semibold mb-3 ${d.direction === 'Long' ? 'text-up' : 'text-down'}`}>
              {d.direction}
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
              <div>
                <span className="text-gray-600 block">Trades</span>
                <span className="text-gray-200 font-medium">{d.count}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Win Rate</span>
                <span className={`font-medium ${d.winRate >= 0.5 ? 'text-up' : 'text-warn'}`}>{(d.winRate * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-gray-600 block">Total R</span>
                <span className={`font-medium ${d.totalR > 0 ? 'text-up' : 'text-down'}`}>{formatR(d.totalR)}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Expectancy</span>
                <span className={`font-medium ${d.expectancy > 0 ? 'text-up' : 'text-down'}`}>{formatR(d.expectancy)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
