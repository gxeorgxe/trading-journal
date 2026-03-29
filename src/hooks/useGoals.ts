import { useCallback } from 'react'
import type { Goal, GoalDraft } from '../types'
import { STORAGE_KEYS } from '../constants'
import { nowIso } from '../utils/dateUtils'
import { useSupabaseSync } from './useSupabaseSync'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseGoalsReturn {
  goals: Goal[]
  addGoal: (draft: GoalDraft) => void
  updateGoal: (id: string, draft: GoalDraft) => void
  deleteGoal: (id: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
}

function toCamel(row: any): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    targetDate: typeof row.target_date === 'string' ? row.target_date.slice(0, 10) : row.target_date,
    color: row.color,
    status: row.status,
    progress: Number(row.progress),
    milestones: row.milestones ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDb(g: Goal, userId: string): Record<string, any> {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    description: g.description,
    target_date: g.targetDate,
    color: g.color,
    status: g.status,
    progress: g.progress,
    milestones: g.milestones,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  }
}

export function useGoals(): UseGoalsReturn {
  const sync = useSupabaseSync<Goal>({
    table: 'goals',
    storageKey: STORAGE_KEYS.GOALS,
    toCamel,
    toDb,
  })

  const goals = sync.data

  const addGoal = useCallback((draft: GoalDraft) => {
    const goal: Goal = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    sync.add(goal)
  }, [sync])

  const updateGoal = useCallback((id: string, draft: GoalDraft) => {
    const existing = goals.find(g => g.id === id)
    const goal: Goal = { ...draft, id, createdAt: existing?.createdAt ?? nowIso(), updatedAt: nowIso() }
    sync.update(id, goal)
  }, [sync, goals])

  const deleteGoal = useCallback((id: string) => {
    sync.remove(id)
  }, [sync])

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const milestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    )
    const doneCount = milestones.filter(m => m.done).length
    const progress = milestones.length ? Math.round(doneCount / milestones.length * 100) : goal.progress
    const updated: Goal = { ...goal, milestones, progress, updatedAt: nowIso() }
    sync.update(goalId, updated)
  }, [sync, goals])

  return { goals, addGoal, updateGoal, deleteGoal, toggleMilestone }
}
