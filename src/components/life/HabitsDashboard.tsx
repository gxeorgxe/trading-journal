import { useState } from 'react'
import type { UseHabitsReturn } from '../../hooks/useHabits'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { HabitForm } from './HabitForm'
import { DailyCheckIn } from './DailyCheckIn'
import { HabitStreakCards } from './HabitStreakCards'
import { HabitCalendar } from './HabitCalendar'

interface Props {
  store: UseHabitsReturn
}

export function HabitsDashboard({ store }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{store.habits.length} habit{store.habits.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>+ New Habit</Button>
      </div>

      <DailyCheckIn store={store} />

      {store.habits.length > 0 && (
        <>
          <HabitStreakCards store={store} />

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Calendar</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {store.habits.map(h => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHabit(selectedHabit === h.id ? null : h.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedHabit === h.id
                      ? 'bg-accent/20 text-accent border-accent/40'
                      : 'text-gray-400 border-white/10 hover:text-gray-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                  {h.name}
                </button>
              ))}
            </div>
            {selectedHabit && <HabitCalendar store={store} habitId={selectedHabit} />}
          </div>
        </>
      )}

      {store.habits.length === 0 && (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-60">✓</div>
            <p className="text-gray-400 text-sm">No habits yet. Create one to start tracking.</p>
          </div>
        </GlassCard>
      )}

      {showForm && (
        <HabitForm
          initial={editing ? store.habits.find(h => h.id === editing) : undefined}
          onSave={draft => editing ? store.updateHabit(editing, draft) : store.addHabit(draft)}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
