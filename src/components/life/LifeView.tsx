import { useState } from 'react'
import { useHabits } from '../../hooks/useHabits'
import { useGoals } from '../../hooks/useGoals'
import { useTransactions } from '../../hooks/useTransactions'
import { HabitsDashboard } from './HabitsDashboard'
import { GoalsDashboard } from './GoalsDashboard'
import { FinanceDashboard } from './FinanceDashboard'

type Tab = 'habits' | 'goals' | 'finance'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'habits', label: 'Habits', icon: '✓' },
  { key: 'goals', label: 'Goals', icon: '🎯' },
  { key: 'finance', label: 'Finance', icon: '$' },
]

export function LifeView() {
  const [tab, setTab] = useState<Tab>('habits')
  const habitStore = useHabits()
  const goalStore = useGoals()
  const txnStore = useTransactions()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-white/5 shrink-0">
        <h1 className="text-lg font-semibold text-gray-100 mb-3">Life Dashboard</h1>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-accent/20 text-accent shadow-glow border border-accent/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {tab === 'habits' && <HabitsDashboard store={habitStore} />}
        {tab === 'goals' && <GoalsDashboard store={goalStore} />}
        {tab === 'finance' && <FinanceDashboard store={txnStore} />}
      </div>
    </div>
  )
}
