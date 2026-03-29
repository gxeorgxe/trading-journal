import { supabase } from '../lib/supabase'
import { readFromStorage, writeToStorage } from './storage'
import { STORAGE_KEYS } from '../constants'
import { uploadScreenshot, isBase64 } from './screenshotStorage'
import type { Trade, Playbook, Habit, HabitLog, Goal, Transaction } from '../types'

const MIGRATED_KEY = 'tj_migrated'

export function hasMigrated(): boolean {
  return readFromStorage<boolean>(MIGRATED_KEY, false)
}

export interface MigrationProgress {
  step: string
  current: number
  total: number
}

export async function migrateLocalDataToSupabase(
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<void> {
  if (hasMigrated()) return

  const report = (step: string, current: number, total: number) => {
    onProgress?.({ step, current, total })
  }

  // ── Trades ──
  const trades = readFromStorage<Trade[]>(STORAGE_KEYS.TRADES, [])
  if (trades.length > 0) {
    report('Migrating trades', 0, trades.length)

    for (let i = 0; i < trades.length; i++) {
      const t = trades[i]

      // Upload screenshots to Storage
      const uploadedUrls: string[] = []
      for (const ss of t.screenshots) {
        if (isBase64(ss)) {
          try {
            const url = await uploadScreenshot(ss, t.id, userId)
            uploadedUrls.push(url)
          } catch {
            // skip failed screenshot uploads
          }
        } else {
          uploadedUrls.push(ss)
        }
      }

      const { error } = await supabase.from('trades').upsert({
        id: t.id,
        user_id: userId,
        date: t.date,
        pair: t.pair,
        entry_time: t.entryTime,
        r: t.r,
        direction: t.direction,
        session: t.session,
        tags: t.tags,
        notes: t.notes,
        screenshots: uploadedUrls,
        playbook_grade: t.playbookGrade ?? null,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }, { onConflict: 'id' })

      if (error) console.warn('Trade migration error:', error.message)
      report('Migrating trades', i + 1, trades.length)
    }
  }

  // ── Playbooks ──
  const playbooks = readFromStorage<Playbook[]>(STORAGE_KEYS.PLAYBOOKS, [])
  if (playbooks.length > 0) {
    report('Migrating playbooks', 0, playbooks.length)
    const rows = playbooks.map(p => ({
      id: p.id,
      user_id: userId,
      name: p.name,
      rules: p.rules,
      color: p.color,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }))
    await supabase.from('playbooks').upsert(rows, { onConflict: 'id' })
    report('Migrating playbooks', playbooks.length, playbooks.length)
  }

  // ── Habits ──
  const habits = readFromStorage<Habit[]>(STORAGE_KEYS.HABITS, [])
  if (habits.length > 0) {
    report('Migrating habits', 0, habits.length)
    const rows = habits.map(h => ({
      id: h.id,
      user_id: userId,
      name: h.name,
      color: h.color,
      target_frequency: h.targetFrequency ?? null,
      created_at: h.createdAt,
      updated_at: h.updatedAt,
    }))
    await supabase.from('habits').upsert(rows, { onConflict: 'id' })
    report('Migrating habits', habits.length, habits.length)
  }

  // ── Habit Logs ──
  const habitLogs = readFromStorage<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, [])
  if (habitLogs.length > 0) {
    report('Migrating habit logs', 0, habitLogs.length)
    // Batch in chunks of 100
    for (let i = 0; i < habitLogs.length; i += 100) {
      const batch = habitLogs.slice(i, i + 100).map(l => ({
        id: l.id,
        user_id: userId,
        habit_id: l.habitId,
        date: l.date,
        done: l.done,
        created_at: l.createdAt,
      }))
      await supabase.from('habit_logs').upsert(batch, { onConflict: 'id' })
      report('Migrating habit logs', Math.min(i + 100, habitLogs.length), habitLogs.length)
    }
  }

  // ── Goals ──
  const goals = readFromStorage<Goal[]>(STORAGE_KEYS.GOALS, [])
  if (goals.length > 0) {
    report('Migrating goals', 0, goals.length)
    const rows = goals.map(g => ({
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
    }))
    await supabase.from('goals').upsert(rows, { onConflict: 'id' })
    report('Migrating goals', goals.length, goals.length)
  }

  // ── Transactions ──
  const transactions = readFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
  if (transactions.length > 0) {
    report('Migrating transactions', 0, transactions.length)
    const rows = transactions.map(t => ({
      id: t.id,
      user_id: userId,
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date,
      notes: t.notes,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }))
    await supabase.from('transactions').upsert(rows, { onConflict: 'id' })
    report('Migrating transactions', transactions.length, transactions.length)
  }

  // Mark as migrated
  writeToStorage(MIGRATED_KEY, true)
}
