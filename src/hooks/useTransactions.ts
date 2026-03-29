import { useCallback, useMemo } from 'react'
import type { Transaction, TransactionDraft } from '../types'
import { STORAGE_KEYS } from '../constants'
import { nowIso } from '../utils/dateUtils'
import { useSupabaseSync } from './useSupabaseSync'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseTransactionsReturn {
  transactions: Transaction[]
  addTransaction: (draft: TransactionDraft) => void
  updateTransaction: (id: string, draft: TransactionDraft) => void
  deleteTransaction: (id: string) => void
  allCategories: string[]
}

function toCamel(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : row.date,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDb(t: Transaction, userId: string): Record<string, any> {
  return {
    id: t.id,
    user_id: userId,
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.date,
    notes: t.notes,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  }
}

export function useTransactions(): UseTransactionsReturn {
  const sync = useSupabaseSync<Transaction>({
    table: 'transactions',
    storageKey: STORAGE_KEYS.TRANSACTIONS,
    toCamel,
    toDb,
    orderBy: { column: 'date', ascending: false },
  })

  const transactions = sync.data

  const addTransaction = useCallback((draft: TransactionDraft) => {
    const txn: Transaction = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    sync.add(txn)
  }, [sync])

  const updateTransaction = useCallback((id: string, draft: TransactionDraft) => {
    const existing = transactions.find(t => t.id === id)
    const txn: Transaction = { ...draft, id, createdAt: existing?.createdAt ?? nowIso(), updatedAt: nowIso() }
    sync.update(id, txn)
  }, [sync, transactions])

  const deleteTransaction = useCallback((id: string) => {
    sync.remove(id)
  }, [sync])

  const allCategories = useMemo(() => [...new Set(transactions.map(t => t.category))].sort(), [transactions])

  return { transactions, addTransaction, updateTransaction, deleteTransaction, allCategories }
}
