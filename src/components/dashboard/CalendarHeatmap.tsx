import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import type { DayCell } from '../../types'
import { buildCalendarData, getMonthStartOffset } from '../../utils/analytics'
import type { Trade } from '../../types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function cellColor(totalR: number | null): string {
  if (totalR === null) return 'bg-surface-border/30'
  if (totalR > 2) return 'bg-up text-white'
  if (totalR > 0) return 'bg-up/40 text-up'
  if (totalR === 0) return 'bg-gray-700 text-gray-400'
  if (totalR > -2) return 'bg-down/40 text-down'
  return 'bg-down text-white'
}

interface Props { trades: Trade[] }

export function CalendarHeatmap({ trades }: Props) {
  const [current, setCurrent] = useState(() => new Date())
  const year = current.getFullYear()
  const month = current.getMonth() + 1

  const cells: DayCell[] = buildCalendarData(trades, year, month)
  const offset = getMonthStartOffset(year, month)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">
          {format(current, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrent(d => subMonths(d, 1))}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-100 hover:bg-white/5 text-sm transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-100 hover:bg-white/5 text-xs transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent(d => addMonths(d, 1))}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-100 hover:bg-white/5 text-sm transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-600 py-1 font-medium">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`blank-${i}`} />)}
        {cells.map(cell => (
          <Tooltip key={cell.date} cell={cell} />
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs text-gray-600">
        <span>Less</span>
        {['bg-down', 'bg-down/40', 'bg-surface-border/30', 'bg-up/40', 'bg-up'].map(c => (
          <div key={c} className={`w-4 h-4 rounded ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function Tooltip({ cell }: { cell: DayCell }) {
  const [show, setShow] = useState(false)
  const day = parseInt(cell.date.split('-')[2])

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className={`rounded-md aspect-square flex items-center justify-center text-xs font-medium cursor-default transition-all ${cellColor(cell.totalR)} ${cell.tradeCount > 0 ? 'ring-1 ring-inset ring-white/10' : ''}`}>
        {day}
      </div>
      {show && cell.tradeCount > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl pointer-events-none">
          <div className="font-medium text-gray-200">{cell.date}</div>
          <div className="text-gray-400">{cell.tradeCount} trade{cell.tradeCount !== 1 ? 's' : ''}</div>
          <div className={cell.totalR! > 0 ? 'text-up' : 'text-down'}>
            {cell.totalR! > 0 ? '+' : ''}{cell.totalR!.toFixed(2)}R
          </div>
        </div>
      )}
    </div>
  )
}
