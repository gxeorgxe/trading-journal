import type { StreakInfo } from '../../types'
import { GlassCard } from '../ui/GlassCard'

interface Props { streaks: StreakInfo }

export function StreakCards({ streaks }: Props) {
  const { currentStreak, bestWinStreak, worstLossStreak } = streaks

  return (
    <div className="grid grid-cols-3 gap-3">
      <GlassCard padding="p-4">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block">Current Streak</span>
        <span className={`text-2xl font-bold tabular-nums ${currentStreak > 0 ? 'text-up' : currentStreak < 0 ? 'text-down' : 'text-gray-400'}`}>
          {currentStreak > 0 ? `${currentStreak}W` : currentStreak < 0 ? `${Math.abs(currentStreak)}L` : '—'}
        </span>
      </GlassCard>
      <GlassCard padding="p-4">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block">Best Win Streak</span>
        <span className="text-2xl font-bold tabular-nums text-up">{bestWinStreak || '—'}</span>
      </GlassCard>
      <GlassCard padding="p-4">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block">Worst Loss Streak</span>
        <span className="text-2xl font-bold tabular-nums text-down">{worstLossStreak || '—'}</span>
      </GlassCard>
    </div>
  )
}
