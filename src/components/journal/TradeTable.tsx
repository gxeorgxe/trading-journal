import { useState } from 'react'
import type { Trade, Playbook, SortField, SortDir } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDisplay } from '../../utils/dateUtils'
import { formatR } from '../../utils/analytics'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { TradeCardMobile } from './TradeCardMobile'

interface Props {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
  playbooks: Playbook[]
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-700 ml-1">↕</span>
  return <span className="text-accent ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function TradeTable({ trades, onEdit, onDelete, playbooks }: Props) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const isDesktop = useMediaQuery(768)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const sorted = [...trades].sort((a, b) => {
    let cmp = 0
    if (sortField === 'date') cmp = a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime)
    else if (sortField === 'pair') cmp = a.pair.localeCompare(b.pair)
    else if (sortField === 'r') cmp = a.r - b.r
    else if (sortField === 'direction') cmp = a.direction.localeCompare(b.direction)
    else if (sortField === 'session') cmp = a.session.localeCompare(b.session)
    else if (sortField === 'entryTime') cmp = a.entryTime.localeCompare(b.entryTime)
    return sortDir === 'asc' ? cmp : -cmp
  })

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4 opacity-60">📒</div>
        <p className="text-gray-400 text-sm">No trades yet. Click <strong className="text-gray-200">Add Trade</strong> to log your first one.</p>
      </div>
    )
  }

  if (!isDesktop) {
    return <TradeCardMobile trades={sorted} onEdit={onEdit} onDelete={onDelete} playbooks={playbooks} />
  }

  const col = (label: string, field: SortField) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-300 select-none whitespace-nowrap"
    >
      {label}<SortIcon active={sortField === field} dir={sortDir} />
    </th>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-white/5">
          <tr>
            <th className="w-1" />
            {col('Date', 'date')}
            {col('Time', 'entryTime')}
            {col('Pair', 'pair')}
            {col('R', 'r')}
            {col('Direction', 'direction')}
            {col('Session', 'session')}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(t => (
            <TradeRow
              key={t.id}
              trade={t}
              expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              playbooks={playbooks}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TradeRow({ trade: t, expanded, onToggle, onEdit, onDelete, playbooks }: {
  trade: Trade; expanded: boolean; onToggle: () => void; onEdit: (t: Trade) => void; onDelete: (id: string) => void; playbooks: Playbook[]
}) {
  const pb = t.playbookGrade ? playbooks.find(p => p.id === t.playbookGrade!.playbookId) : undefined
  const adherence = t.playbookGrade?.rulesFollowed.length
    ? t.playbookGrade.rulesFollowed.filter(Boolean).length
    : 0
  const totalRules = t.playbookGrade?.rulesFollowed.length ?? 0
  const borderColor = t.r > 0 ? 'border-l-up' : t.r < 0 ? 'border-l-down' : 'border-l-gray-600'

  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-l-4 ${borderColor} cursor-pointer transition-colors hover:bg-white/[0.04] ${expanded ? 'bg-white/[0.03]' : 'even:bg-white/[0.02]'}`}
      >
        <td className="w-1" />
        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatDisplay(t.date)}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.entryTime || '—'}</td>
        <td className="px-4 py-3 font-mono font-semibold text-gray-100">{t.pair}</td>
        <td className={`px-4 py-3 font-bold tabular-nums whitespace-nowrap ${t.r > 0 ? 'text-up' : t.r < 0 ? 'text-down' : 'text-gray-400'}`}>
          {formatR(t.r)}
        </td>
        <td className="px-4 py-3">
          <Badge label={t.direction} color={t.direction === 'Long' ? 'up' : 'down'} />
        </td>
        <td className="px-4 py-3 text-gray-400">{t.session}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={() => onEdit(t)} title="Edit trade">✏️</Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(t.id)} title="Delete trade">🗑️</Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="animate-slide-up bg-white/[0.02] border-t border-white/5 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Playbook</p>
                {pb ? (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                      <span className="text-xs font-medium text-gray-200">{pb.name}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${adherence === totalRules ? 'text-up' : adherence > 0 ? 'text-warn' : 'text-gray-500'}`}>
                      {adherence}/{totalRules} rules ({totalRules ? Math.round(adherence / totalRules * 100) : 0}%)
                    </span>
                  </div>
                ) : <span className="text-gray-600 text-xs">None</span>}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {t.tags.length ? t.tags.map(tag => <Badge key={tag} label={tag} />) : <span className="text-gray-600 text-xs">No tags</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Notes</p>
                <p className="text-xs text-gray-300 whitespace-pre-wrap">{t.notes || 'No notes'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Screenshots</p>
                {t.screenshots.length ? (
                  <div className="flex gap-2 flex-wrap">
                    {t.screenshots.map((src, i) => (
                      <img key={i} src={src} alt={`screenshot ${i + 1}`} className="w-20 h-14 object-cover rounded-lg border border-white/10" />
                    ))}
                  </div>
                ) : <span className="text-gray-600 text-xs">None</span>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
