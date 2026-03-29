import { useState, useMemo, useCallback } from 'react'
import type { Trade, FilterState } from '../types'
import { FILTER_DEFAULTS } from '../constants'

export interface UseFiltersReturn {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  filteredTrades: Trade[]
  hasActiveFilters: boolean
}

export function useFilters(trades: Trade[]): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(FILTER_DEFAULTS)

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => setFilters(FILTER_DEFAULTS), [])

  const filteredTrades = useMemo(() => trades.filter(t => {
    if (filters.dateFrom && t.date < filters.dateFrom) return false
    if (filters.dateTo && t.date > filters.dateTo) return false
    if (filters.pairs.length && !filters.pairs.includes(t.pair)) return false
    if (filters.sessions.length && !filters.sessions.includes(t.session)) return false
    if (filters.directions.length && !filters.directions.includes(t.direction)) return false
    if (filters.tags.length && !filters.tags.some(tag => t.tags.includes(tag))) return false
    if (filters.playbooks.length && !filters.playbooks.includes(t.playbookGrade?.playbookId ?? '')) return false
    return true
  }), [trades, filters])

  const hasActiveFilters = Object.values(filters).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== ''
  )

  return { filters, setFilter, clearFilters, filteredTrades, hasActiveFilters }
}
