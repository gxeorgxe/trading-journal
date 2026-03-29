import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { readFromStorage, writeToStorage } from '../utils/storage'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SyncConfig<TLocal> {
  table: string
  storageKey: string
  toCamel: (row: any) => TLocal
  toDb: (item: TLocal, userId: string) => Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
}

interface SyncReturn<TLocal> {
  data: TLocal[]
  loading: boolean
  setData: React.Dispatch<React.SetStateAction<TLocal[]>>
  add: (item: TLocal) => void
  update: (id: string, item: TLocal) => void
  remove: (id: string) => void
  bulkInsert: (items: TLocal[]) => void
}

const SYNC_QUEUE_KEY = 'tj_sync_queue'

interface QueuedOp {
  table: string
  type: 'insert' | 'update' | 'delete' | 'bulk_insert'
  payload: any
}

function pushToQueue(op: QueuedOp) {
  const queue = readFromStorage<QueuedOp[]>(SYNC_QUEUE_KEY, [])
  queue.push(op)
  writeToStorage(SYNC_QUEUE_KEY, queue)
}

async function flushQueue() {
  const queue = readFromStorage<QueuedOp[]>(SYNC_QUEUE_KEY, [])
  if (queue.length === 0) return

  const remaining: QueuedOp[] = []

  for (const op of queue) {
    try {
      if (op.type === 'insert') {
        const { error } = await supabase.from(op.table).insert(op.payload)
        if (error) { remaining.push(op); continue }
      } else if (op.type === 'update') {
        const { id, ...data } = op.payload
        const { error } = await supabase.from(op.table).update(data).eq('id', id)
        if (error) { remaining.push(op); continue }
      } else if (op.type === 'delete') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.payload.id)
        if (error) { remaining.push(op); continue }
      } else if (op.type === 'bulk_insert') {
        const { error } = await supabase.from(op.table).upsert(op.payload, { onConflict: 'id' })
        if (error) { remaining.push(op); continue }
      }
    } catch {
      remaining.push(op)
    }
  }

  writeToStorage(SYNC_QUEUE_KEY, remaining)
}

export function useSupabaseSync<TLocal extends { id: string }>(config: SyncConfig<TLocal>): SyncReturn<TLocal> {
  const { table, storageKey, toCamel, toDb, orderBy } = config
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const [data, setData] = useState<TLocal[]>(() =>
    readFromStorage<TLocal[]>(storageKey, [])
  )
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  // Persist to localStorage whenever data changes
  const persistLocal = useCallback((next: TLocal[]) => {
    setData(next)
    writeToStorage(storageKey, next)
  }, [storageKey])

  // Fetch from Supabase on mount
  useEffect(() => {
    if (!userId || hasFetched.current) return
    hasFetched.current = true

    const fetchData = async () => {
      // Flush any pending operations first
      await flushQueue()

      let query = supabase.from(table).select('*').eq('user_id', userId)
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      const { data: rows, error } = await query

      if (!error && rows) {
        const mapped = rows.map(toCamel)
        persistLocal(mapped)
      }
      setLoading(false)
    }

    fetchData()
  }, [userId, table, toCamel, orderBy, persistLocal])

  // Listen for online events to flush queue
  useEffect(() => {
    const handler = () => flushQueue()
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [])

  const add = useCallback((item: TLocal) => {
    setData(prev => {
      const next = [...prev, item]
      writeToStorage(storageKey, next)
      return next
    })

    if (!userId) return
    const dbRow = toDb(item, userId)

    if (navigator.onLine) {
      supabase.from(table).insert(dbRow).then(({ error }) => {
        if (error) pushToQueue({ table, type: 'insert', payload: dbRow })
      })
    } else {
      pushToQueue({ table, type: 'insert', payload: dbRow })
    }
  }, [userId, table, storageKey, toDb])

  const update = useCallback((id: string, item: TLocal) => {
    setData(prev => {
      const next = prev.map(d => d.id === id ? item : d)
      writeToStorage(storageKey, next)
      return next
    })

    if (!userId) return
    const dbRow = toDb(item, userId)

    if (navigator.onLine) {
      supabase.from(table).update(dbRow).eq('id', id).then(({ error }) => {
        if (error) pushToQueue({ table, type: 'update', payload: { id, ...dbRow } })
      })
    } else {
      pushToQueue({ table, type: 'update', payload: { id, ...dbRow } })
    }
  }, [userId, table, storageKey, toDb])

  const remove = useCallback((id: string) => {
    setData(prev => {
      const next = prev.filter(d => d.id !== id)
      writeToStorage(storageKey, next)
      return next
    })

    if (!userId) return

    if (navigator.onLine) {
      supabase.from(table).delete().eq('id', id).then(({ error }) => {
        if (error) pushToQueue({ table, type: 'delete', payload: { id } })
      })
    } else {
      pushToQueue({ table, type: 'delete', payload: { id } })
    }
  }, [userId, table, storageKey])

  const bulkInsert = useCallback((items: TLocal[]) => {
    setData(prev => {
      const next = [...prev, ...items]
      writeToStorage(storageKey, next)
      return next
    })

    if (!userId || items.length === 0) return
    const dbRows = items.map(item => toDb(item, userId))

    if (navigator.onLine) {
      supabase.from(table).upsert(dbRows, { onConflict: 'id' }).then(({ error }) => {
        if (error) pushToQueue({ table, type: 'bulk_insert', payload: dbRows })
      })
    } else {
      pushToQueue({ table, type: 'bulk_insert', payload: dbRows })
    }
  }, [userId, table, storageKey, toDb])

  return { data, loading, setData, add, update, remove, bulkInsert }
}
