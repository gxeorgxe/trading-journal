import { useCallback } from 'react'
import type { Habit, HabitDraft, HabitLog } from '../types'
import { STORAGE_KEYS } from '../constants'
import { nowIso } from '../utils/dateUtils'
import { useSupabaseSync } from './useSupabaseSync'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseHabitsReturn {
  habits: Habit[]
  logs: HabitLog[]
  addHabit: (draft: HabitDraft) => void
  updateHabit: (id: string, draft: HabitDraft) => void
  deleteHabit: (id: string) => void
  toggleDay: (habitId: string, date: string) => void
  getLogsForDate: (date: string) => HabitLog[]
  isDone: (habitId: string, date: string) => boolean
}

function habitToCamel(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    targetFrequency: row.target_frequency ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function habitToDb(h: Habit, userId: string): Record<string, any> {
  return {
    id: h.id,
    user_id: userId,
    name: h.name,
    color: h.color,
    target_frequency: h.targetFrequency ?? null,
    created_at: h.createdAt,
    updated_at: h.updatedAt,
  }
}

function logToCamel(row: any): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : row.date,
    done: row.done,
    createdAt: row.created_at,
  }
}

function logToDb(log: HabitLog, userId: string): Record<string, any> {
  return {
    id: log.id,
    user_id: userId,
    habit_id: log.habitId,
    date: log.date,
    done: log.done,
    created_at: log.createdAt,
  }
}

export function useHabits(): UseHabitsReturn {
  const habitSync = useSupabaseSync<Habit>({
    table: 'habits',
    storageKey: STORAGE_KEYS.HABITS,
    toCamel: habitToCamel,
    toDb: habitToDb,
  })

  const logSync = useSupabaseSync<HabitLog>({
    table: 'habit_logs',
    storageKey: STORAGE_KEYS.HABIT_LOGS,
    toCamel: logToCamel,
    toDb: logToDb,
  })

  const habits = habitSync.data
  const logs = logSync.data

  const addHabit = useCallback((draft: HabitDraft) => {
    const habit: Habit = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    habitSync.add(habit)
  }, [habitSync])

  const updateHabit = useCallback((id: string, draft: HabitDraft) => {
    const existing = habits.find(h => h.id === id)
    const habit: Habit = { ...draft, id, createdAt: existing?.createdAt ?? nowIso(), updatedAt: nowIso() }
    habitSync.update(id, habit)
  }, [habitSync, habits])

  const deleteHabit = useCallback((id: string) => {
    habitSync.remove(id)
    // Remove associated logs locally (DB handles cascade)
    const logsToRemove = logs.filter(l => l.habitId === id)
    for (const log of logsToRemove) {
      logSync.remove(log.id)
    }
  }, [habitSync, logSync, logs])

  const toggleDay = useCallback((habitId: string, date: string) => {
    const existing = logs.find(l => l.habitId === habitId && l.date === date)
    if (existing) {
      logSync.remove(existing.id)
    } else {
      const log: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date,
        done: true,
        createdAt: nowIso(),
      }
      logSync.add(log)
    }
  }, [logs, logSync])

  const getLogsForDate = useCallback((date: string) =>
    logs.filter(l => l.date === date)
  , [logs])

  const isDone = useCallback((habitId: string, date: string) =>
    logs.some(l => l.habitId === habitId && l.date === date)
  , [logs])

  return { habits, logs, addHabit, updateHabit, deleteHabit, toggleDay, getLogsForDate, isDone }
}
