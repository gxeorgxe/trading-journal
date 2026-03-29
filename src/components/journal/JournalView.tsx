import { useState, useRef } from 'react'
import type { Trade, Playbook } from '../../types'
import type { UseTradesReturn } from '../../hooks/useTrades'
import type { UseFiltersReturn } from '../../hooks/useFilters'
import { TradeTable } from './TradeTable'
import { TradeForm } from './TradeForm'
import { ImportModal } from './ImportModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { FilterBar } from '../filters/FilterBar'
import { Button } from '../ui/Button'
import { downloadJson } from '../../utils/storage'

interface Props {
  tradeStore: UseTradesReturn
  filterStore: UseFiltersReturn
  playbooks: Playbook[]
}

export function JournalView({ tradeStore, filterStore, playbooks }: Props) {
  const { trades, addTrade, updateTrade, deleteTrade, importTrades, allTags, allPairs } = tradeStore
  const { filters, setFilter, clearFilters, filteredTrades, hasActiveFilters } = filterStore

  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<Trade | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        const arr: Trade[] = Array.isArray(parsed) ? parsed : parsed.trades ?? []
        importTrades(arr, false)
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">Trade Journal</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredTrades.length} {hasActiveFilters ? 'filtered' : ''} trade{filteredTrades.length !== 1 ? 's' : ''}{trades.length !== filteredTrades.length ? ` of ${trades.length} total` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => downloadJson(trades, `trades-${new Date().toISOString().slice(0,10)}.json`)} className="hidden sm:inline-flex">
            ↓ Export
          </Button>
          <Button variant="secondary" size="sm" onClick={() => importRef.current?.click()} className="hidden sm:inline-flex">
            ↑ JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)} className="hidden sm:inline-flex">
            📊 Import Excel
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Add Trade</span>
          </Button>
        </div>
      </div>

      <FilterBar filters={filters} setFilter={setFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} allTags={allTags} allPairs={allPairs} playbooks={playbooks} />

      <div className="flex-1 overflow-auto">
        <TradeTable
          trades={filteredTrades}
          onEdit={t => { setEditing(t); setShowForm(true) }}
          onDelete={id => setConfirmId(id)}
          playbooks={playbooks}
        />
      </div>

      {showForm && (
        <TradeForm
          initial={editing ?? undefined}
          onSave={draft => editing ? updateTrade(editing.id, draft) : addTrade(draft)}
          onClose={() => { setShowForm(false); setEditing(null) }}
          allTags={allTags}
          allPairs={allPairs}
          playbooks={playbooks}
        />
      )}

      {showImport && (
        <ImportModal
          onImport={importTrades}
          onClose={() => setShowImport(false)}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          message="Delete this trade? This cannot be undone."
          onConfirm={() => { deleteTrade(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  )
}
