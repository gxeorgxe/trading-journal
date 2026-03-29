import type { Goal } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { formatDisplay } from '../../utils/dateUtils'
import { differenceInDays, parseISO } from 'date-fns'

interface Props {
  goal: Goal
  onToggleMilestone: (milestoneId: string) => void
  onEdit: () => void
  onDelete: () => void
}

export function GoalCard({ goal: g, onToggleMilestone, onEdit, onDelete }: Props) {
  const daysLeft = g.targetDate ? differenceInDays(parseISO(g.targetDate), new Date()) : null
  const statusColors: Record<string, string> = {
    active: 'text-accent',
    completed: 'text-up',
    abandoned: 'text-gray-500',
  }

  return (
    <GlassCard padding="p-0" className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: g.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
              <h3 className="text-sm font-semibold text-gray-100 truncate">{g.name}</h3>
              <span className={`text-[10px] uppercase font-medium ${statusColors[g.status]}`}>{g.status}</span>
            </div>
            {g.description && <p className="text-xs text-gray-500 line-clamp-2 ml-[18px]">{g.description}</p>}
          </div>
          <div className="flex gap-1 shrink-0 ml-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>✏️</Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>🗑️</Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-300 font-medium">{g.progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${g.progress}%`, backgroundColor: g.color }}
            />
          </div>
        </div>

        {/* Milestones */}
        {g.milestones.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-3">
            {g.milestones.map(m => (
              <button
                key={m.id}
                onClick={() => onToggleMilestone(m.id)}
                className="flex items-center gap-2 text-left group"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                    m.done ? 'border-transparent' : 'border-gray-600 group-hover:border-gray-400'
                  }`}
                  style={m.done ? { backgroundColor: g.color } : undefined}
                >
                  {m.done && <span className="text-white text-[9px] font-bold">✓</span>}
                </div>
                <span className={`text-xs ${m.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
          {g.targetDate && (
            <span>
              {daysLeft !== null && daysLeft >= 0
                ? `${daysLeft} days left`
                : daysLeft !== null
                ? `${Math.abs(daysLeft)} days overdue`
                : ''
              }
              {' · '}{formatDisplay(g.targetDate)}
            </span>
          )}
          {g.milestones.length > 0 && (
            <span>{g.milestones.filter(m => m.done).length}/{g.milestones.length} milestones</span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
