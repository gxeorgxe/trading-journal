import type { UseHabitsReturn } from '../../hooks/useHabits'
import { GlassCard } from '../ui/GlassCard'
import { computeHabitStreak, computeCompletionRate } from '../../utils/lifeAnalytics'

interface Props {
  store: UseHabitsReturn
}

export function HabitStreakCards({ store }: Props) {
  const { habits, logs } = store

  if (habits.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {habits.map(h => {
        const { current, best } = computeHabitStreak(logs, h.id)
        const rate = computeCompletionRate(logs, h.id, 30)

        return (
          <GlassCard key={h.id} padding="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
              <span className="text-sm font-medium text-gray-200 truncate">{h.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600">Streak</p>
                <p className="text-lg font-bold text-accent">{current}d</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600">Best</p>
                <p className="text-lg font-bold text-gray-200">{best}d</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600">30d</p>
                <p className={`text-lg font-bold ${rate >= 80 ? 'text-up' : rate >= 50 ? 'text-warn' : 'text-down'}`}>{rate}%</p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
