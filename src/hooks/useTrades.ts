import { useCallback, useMemo } from 'react'
import type { Trade, TradeDraft } from '../types'
import { STORAGE_KEYS } from '../constants'
import { nowIso } from '../utils/dateUtils'
import { useSupabaseSync } from './useSupabaseSync'
import { useAuth } from '../contexts/AuthContext'
import { uploadScreenshots, deleteTradeScreenshots, isBase64 } from '../utils/screenshotStorage'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseTradesReturn {
  trades: Trade[]
  addTrade: (draft: TradeDraft) => void
  updateTrade: (id: string, draft: TradeDraft) => void
  deleteTrade: (id: string) => void
  importTrades: (incoming: Trade[], replace: boolean) => void
  allTags: string[]
  allPairs: string[]
}

function toCamel(row: any): Trade {
  return {
    id: row.id,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : row.date,
    pair: row.pair,
    entryTime: row.entry_time ?? '',
    r: Number(row.r),
    direction: row.direction,
    session: row.session,
    tags: row.tags ?? [],
    notes: row.notes ?? '',
    screenshots: row.screenshots ?? [],
    playbookGrade: row.playbook_grade ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDb(trade: Trade, userId: string): Record<string, any> {
  return {
    id: trade.id,
    user_id: userId,
    date: trade.date,
    pair: trade.pair,
    entry_time: trade.entryTime,
    r: trade.r,
    direction: trade.direction,
    session: trade.session,
    tags: trade.tags,
    notes: trade.notes,
    screenshots: trade.screenshots,
    playbook_grade: trade.playbookGrade ?? null,
    created_at: trade.createdAt,
    updated_at: trade.updatedAt,
  }
}

export function useTrades(): UseTradesReturn {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const sync = useSupabaseSync<Trade>({
    table: 'trades',
    storageKey: STORAGE_KEYS.TRADES,
    toCamel,
    toDb,
    orderBy: { column: 'date', ascending: true },
  })

  const trades = sync.data

  const addTrade = useCallback((draft: TradeDraft) => {
    const id = crypto.randomUUID()
    const now = nowIso()
    const trade: Trade = { ...draft, id, createdAt: now, updatedAt: now }

    // If there are base64 screenshots, upload them
    if (userId && draft.screenshots.some(isBase64)) {
      uploadScreenshots(draft.screenshots, id, userId).then(urls => {
        const withUrls = { ...trade, screenshots: urls }
        sync.update(id, withUrls)
      })
      // Add with base64 for now (instant UI), then update with URLs
      sync.add(trade)
    } else {
      sync.add(trade)
    }
  }, [sync, userId])

  const updateTrade = useCallback((id: string, draft: TradeDraft) => {
    const existing = trades.find(t => t.id === id)
    const now = nowIso()
    const trade: Trade = { ...draft, id, createdAt: existing?.createdAt ?? now, updatedAt: now }

    if (userId && draft.screenshots.some(isBase64)) {
      uploadScreenshots(draft.screenshots, id, userId).then(urls => {
        const withUrls = { ...trade, screenshots: urls }
        sync.update(id, withUrls)
      })
      sync.update(id, trade)
    } else {
      sync.update(id, trade)
    }
  }, [sync, trades, userId])

  const deleteTrade = useCallback((id: string) => {
    sync.remove(id)
    if (userId) {
      deleteTradeScreenshots(id, userId).catch(() => {})
    }
  }, [sync, userId])

  const importTrades = useCallback((incoming: Trade[], replace: boolean) => {
    if (replace) {
      sync.setData(incoming)
    } else {
      sync.bulkInsert(incoming)
    }
  }, [sync])

  const allTags = useMemo(() => [...new Set(trades.flatMap(t => t.tags))].sort(), [trades])
  const allPairs = useMemo(() => [...new Set(trades.map(t => t.pair))].sort(), [trades])

  return { trades, addTrade, updateTrade, deleteTrade, importTrades, allTags, allPairs }
}
