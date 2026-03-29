import { useState } from 'react'
import type { UseHabitsReturn } from '../../hooks/useHabits'
import { GlassCard } from '../ui/GlassCard'
import { buildHabitCalendarData } from '../../utils/lifeAnalytics'
import { DAYS_OF_WEEK } from '../../constants'
import { format, getDay } from 'date-fns'

interface Props {
  store: UseHabitsReturn
  habitId: string
}

export function HabitCalendar({ store, habitId }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const habit = store.habits.find(h => h.id === habitId)
  if (!habit) return null

  const data = buildHabitCalendarData(store.logs, habitId, year, month)
  const firstDay = new Date(year, month - 1, 1)
  // getDay: 0=Sun, adjust so Mon=0
  const offset = (getDay(firstDay) + 6) % 7

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else setMonth(month - 1)
  }
  const next = () => {
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else setMonth(month + 1)
  }

  const doneCount = data.filter(d => d.done).length
  const total = data.length

  return (
    <GlassCard padding="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-200">{format(firstDay, 'MMMM yyyy')}</span>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-gray-500">{doneCount}/{total} days</span>
          <button onClick={prev} className="text-gray-400 hover:text-gray-200 text-sm px-1">‹</button>
          <button onClick={next} className="text-gray-400 hover:text-gray-200 text-sm px-1">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[9px] text-gray-600 uppercase pb-1">{d.slice(0, 2)}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {data.map(d => (
          <button
            key={d.date}
            onClick={() => store.toggleDay(habitId, d.date)}
            className={`aspect-square rounded-md text-[10px] flex items-center justify-center transition-all ${
              d.done
                ? 'text-white font-medium'
                : 'text-gray-600 hover:bg-white/5'
            }`}
            style={d.done ? { backgroundColor: habit.color + 'cc' } : undefined}
          >
            {parseInt(d.date.slice(8))}
          </button>
        ))}
      </div>
    </GlassCard>
  )
}
