import { useState } from 'react'
import type { FilterState, Playbook } from '../../types'
import { SESSIONS, DIRECTIONS } from '../../constants'
import { Button } from '../ui/Button'

interface Props {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  allTags: string[]
  allPairs: string[]
  playbooks?: Playbook[]
}

function MultiSelect({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o])

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              value.includes(o)
                ? 'bg-accent/20 text-accent border-accent/40 shadow-glow'
                : 'text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterBar({ filters, setFilter, clearFilters, hasActiveFilters, allTags, allPairs, playbooks = [] }: Props) {
  const [open, setOpen] = useState(false)
  const pairs = [...new Set(allPairs)].sort()

  return (
    <div className="bg-white/[0.02] border-b border-white/5">
      <div className="md:hidden px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-gray-400 font-medium flex items-center gap-1"
        >
          <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
          Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent ml-1" />}
        </button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      <div className={`px-4 md:px-6 py-3 md:py-4 flex flex-wrap gap-4 md:gap-5 items-end ${open ? '' : 'hidden md:flex'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">From</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilter('dateFrom', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-accent focus:shadow-glow transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">To</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilter('dateTo', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-accent focus:shadow-glow transition-all"
            />
          </div>
        </div>

        <MultiSelect label="Session" options={[...SESSIONS]} value={filters.sessions} onChange={v => setFilter('sessions', v)} />
        <MultiSelect label="Direction" options={[...DIRECTIONS]} value={filters.directions} onChange={v => setFilter('directions', v)} />
        {allTags.length > 0 && (
          <MultiSelect label="Tags" options={allTags} value={filters.tags} onChange={v => setFilter('tags', v)} />
        )}

        {playbooks.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Playbook</span>
            <div className="flex flex-wrap gap-1">
              {playbooks.map(pb => (
                <button
                  key={pb.id}
                  type="button"
                  onClick={() => {
                    const v = filters.playbooks
                    setFilter('playbooks', v.includes(pb.id) ? v.filter(x => x !== pb.id) : [...v, pb.id])
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    filters.playbooks.includes(pb.id)
                      ? 'bg-accent/20 text-accent border-accent/40 shadow-glow'
                      : 'text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                  {pb.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {pairs.length > 0 && (
          <MultiSelect label="Pair" options={pairs} value={filters.pairs} onChange={v => setFilter('pairs', v)} />
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="self-end mb-0.5 hidden md:inline-flex">
            ✕ Clear
          </Button>
        )}
      </div>
    </div>
  )
}
