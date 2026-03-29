import type { Transaction } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { computeCategoryBreakdown } from '../../utils/lifeAnalytics'
import { PLAYBOOK_COLORS } from '../../constants'

interface Props {
  transactions: Transaction[]
  yearMonth: string
}

export function CategoryBreakdown({ transactions, yearMonth }: Props) {
  const data = computeCategoryBreakdown(transactions, 'expense', yearMonth)
  if (data.length === 0) return null

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-200 mb-1">Spending by Category</h3>
      <p className="text-[10px] text-gray-500 mb-4">This month's breakdown</p>
      <div className="flex flex-col gap-3">
        {data.map((d, i) => {
          const color = PLAYBOOK_COLORS[i % PLAYBOOK_COLORS.length]
          return (
            <div key={d.category}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300">{d.category}</span>
                <span className="text-gray-400 tabular-nums">
                  ${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-gray-600 ml-1">({d.percentage}%)</span>
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (d.amount / total) * 100 : 0}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
