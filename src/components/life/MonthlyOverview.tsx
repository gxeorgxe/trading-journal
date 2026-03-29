import type { Transaction } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { computeMonthlyBreakdown } from '../../utils/lifeAnalytics'

interface Props {
  transactions: Transaction[]
  yearMonth: string
}

export function MonthlyOverview({ transactions, yearMonth }: Props) {
  const { totalIncome, totalExpenses, net } = computeMonthlyBreakdown(transactions, yearMonth)
  const savingsRate = totalIncome > 0 ? Math.round(net / totalIncome * 100) : 0

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <GlassCard padding="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Income</p>
        <p className="text-xl font-bold text-up">{fmt(totalIncome)}</p>
      </GlassCard>
      <GlassCard padding="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Expenses</p>
        <p className="text-xl font-bold text-down">{fmt(totalExpenses)}</p>
      </GlassCard>
      <GlassCard padding="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Net</p>
        <p className={`text-xl font-bold ${net >= 0 ? 'text-up' : 'text-down'}`}>
          {net >= 0 ? '+' : '-'}{fmt(net)}
        </p>
      </GlassCard>
      <GlassCard padding="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Savings Rate</p>
        <p className={`text-xl font-bold ${savingsRate >= 20 ? 'text-up' : savingsRate >= 0 ? 'text-warn' : 'text-down'}`}>
          {savingsRate}%
        </p>
      </GlassCard>
    </div>
  )
}
