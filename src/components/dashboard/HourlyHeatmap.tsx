import { useState } from 'react'
import type { HourlyCell } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { DAYS_OF_WEEK } from '../../constants'

interface Props { data: HourlyCell[] }

function cellBg(avgR: number): string {
  if (avgR > 1) return 'bg-up/80'
  if (avgR > 0) return 'bg-up/30'
  if (avgR === 0) return 'bg-gray-700/30'
  if (avgR > -1) return 'bg-down/30'
  return 'bg-down/80'
}

export function HourlyHeatmap({ data }: Props) {
  const [hovered, setHovered] = useState<HourlyCell | null>(null)

  if (data.length === 0) return null

  const hours = [...new Set(data.map(d => d.hour))].sort((a, b) => a - b)
  const lookup = new Map(data.map(d => [`${d.hour}-${d.dayOfWeek}`, d]))

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance by Hour & Day</h3>
      <div className="overflow-x-auto">
        <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(7, 1fr)`, minWidth: 350 }}>
          <div />
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-600 font-medium py-1">{d}</div>
          ))}
          {hours.map(h => (
            <div key={h} className="contents">
              <div className="text-[10px] text-gray-600 flex items-center justify-end pr-2">{String(h).padStart(2, '0')}:00</div>
              {Array.from({ length: 7 }).map((_, dow) => {
                const cell = lookup.get(`${h}-${dow}`)
                return (
                  <div
                    key={dow}
                    className={`rounded-md aspect-[2/1] min-h-[24px] flex items-center justify-center text-[10px] font-medium cursor-default transition-all ${cell ? cellBg(cell.avgR) : 'bg-white/[0.02]'}`}
                    onMouseEnter={() => cell && setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {cell ? cell.count : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {hovered && (
        <div className="mt-3 text-xs text-gray-400">
          {DAYS_OF_WEEK[hovered.dayOfWeek]} {String(hovered.hour).padStart(2, '0')}:00 — {hovered.count} trades, avg {hovered.avgR > 0 ? '+' : ''}{hovered.avgR.toFixed(2)}R
        </div>
      )}
    </GlassCard>
  )
}
