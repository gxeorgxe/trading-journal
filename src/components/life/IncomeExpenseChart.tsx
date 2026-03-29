import type { Transaction } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { computeMonthlyTrend } from '../../utils/lifeAnalytics'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  transactions: Transaction[]
}

export function IncomeExpenseChart({ transactions }: Props) {
  const data = computeMonthlyTrend(transactions)
  if (data.length === 0) return null

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-200 mb-1">Income vs Expenses</h3>
      <p className="text-[10px] text-gray-500 mb-4">Monthly comparison</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12 }}
            formatter={(value: number, name: string) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, name]}
          />
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
