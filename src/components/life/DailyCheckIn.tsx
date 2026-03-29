import { useState } from 'react'
import type { UseHabitsReturn } from '../../hooks/useHabits'
import { GlassCard } from '../ui/GlassCard'
import { today } from '../../utils/dateUtils'
import { format, subDays, addDays, parseISO } from 'date-fns'

interface Props {
  store: UseHabitsReturn
}

export function DailyCheckIn({ store }: Props) {
  const [date, setDate] = useState(today())
  const { habits, isDone, toggleDay } = store

  if (habits.length === 0) return null

  const d = parseISO(date)
  const prev = format(subDays(d, 1), 'yyyy-MM-dd')
  const next = format(addDays(d, 1), 'yyyy-MM-dd')
  const isToday = date === today()
  const doneCount = habits.filter(h => isDone(h.id, date)).length

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setDate(prev)} className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1">‹</button>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-200">
            {isToday ? 'Today' : format(d, 'EEE, dd MMM yyyy')}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">{doneCount}/{habits.length} completed</p>
        </div>
        <button onClick={() => setDate(next)} className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1">›</button>
      </div>

      <div className="flex flex-col gap-2">
        {habits.map(h => {
          const done = isDone(h.id, date)
          return (
            <button
              key={h.id}
              onClick={() => toggleDay(h.id, date)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                done
                  ? 'bg-white/[0.06] border-white/10'
                  : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                  done ? 'border-transparent' : 'border-gray-600'
                }`}
                style={done ? { backgroundColor: h.color } : undefined}
              >
                {done && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className={`text-sm ${done ? 'text-gray-300 line-through' : 'text-gray-200'}`}>
                {h.name}
              </span>
              {h.targetFrequency && (
                <span className="ml-auto text-[10px] text-gray-600">{h.targetFrequency}x/wk</span>
              )}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}
