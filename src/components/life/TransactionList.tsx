import type { Transaction } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { formatDisplay } from '../../utils/dateUtils'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Props {
  transactions: Transaction[]
  yearMonth: string
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, yearMonth, onEdit, onDelete }: Props) {
  const isDesktop = useMediaQuery(768)
  const filtered = transactions
    .filter(t => t.date.startsWith(yearMonth))
    .sort((a, b) => b.date.localeCompare(a.date))

  if (filtered.length === 0) return null

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-2">
        {filtered.map(t => (
          <GlassCard key={t.id} padding="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-200">{t.category}</span>
              <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-up' : 'text-down'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{formatDisplay(t.date)}</span>
              <span className={`uppercase font-medium ${t.type === 'income' ? 'text-up' : 'text-down'}`}>{t.type}</span>
              {t.notes && <span className="truncate ml-auto">{t.notes}</span>}
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <GlassCard padding="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest">Date</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest">Category</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatDisplay(t.date)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-md ${
                    t.type === 'income' ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-200">{t.category}</td>
                <td className={`px-4 py-3 text-right font-bold tabular-nums ${t.type === 'income' ? 'text-up' : 'text-down'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{t.notes || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>✏️</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(t.id)}>🗑️</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
