import { useState } from 'react'
import type { UseGoalsReturn } from '../../hooks/useGoals'
import type { Goal, GoalStatus } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { GoalForm } from './GoalForm'
import { GoalCard } from './GoalCard'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface Props {
  store: UseGoalsReturn
}

type Filter = 'all' | GoalStatus

export function GoalsDashboard({ store }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('active')

  const filters: { key: Filter; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'abandoned', label: 'Abandoned' },
    { key: 'all', label: 'All' },
  ]

  const filtered = filter === 'all' ? store.goals : store.goals.filter(g => g.status === filter)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>+ New Goal</Button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onToggleMilestone={(mid) => store.toggleMilestone(g.id, mid)}
              onEdit={() => { setEditing(g); setShowForm(true) }}
              onDelete={() => setConfirmId(g.id)}
            />
          ))}
        </div>
      ) : (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-60">🎯</div>
            <p className="text-gray-400 text-sm">
              {filter === 'active' ? 'No active goals. Create one to get started.' : 'No goals in this category.'}
            </p>
          </div>
        </GlassCard>
      )}

      {showForm && (
        <GoalForm
          initial={editing ?? undefined}
          onSave={draft => editing ? store.updateGoal(editing.id, draft) : store.addGoal(draft)}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          message="Delete this goal? This cannot be undone."
          onConfirm={() => { store.deleteGoal(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
