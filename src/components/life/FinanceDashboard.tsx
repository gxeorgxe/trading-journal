import { useState } from 'react'
import type { UseTransactionsReturn } from '../../hooks/useTransactions'
import type { Transaction } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'
import { MonthlyOverview } from './MonthlyOverview'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { format } from 'date-fns'

interface Props {
  store: UseTransactionsReturn
}

export function FinanceDashboard({ store }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>+ Add Transaction</Button>
      </div>

      <MonthlyOverview transactions={store.transactions} yearMonth={selectedMonth} />

      {store.transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IncomeExpenseChart transactions={store.transactions} />
            <CategoryBreakdown transactions={store.transactions} yearMonth={selectedMonth} />
          </div>
        </>
      )}

      <TransactionList
        transactions={store.transactions}
        yearMonth={selectedMonth}
        onEdit={t => { setEditing(t); setShowForm(true) }}
        onDelete={id => setConfirmId(id)}
      />

      {store.transactions.length === 0 && (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-60">$</div>
            <p className="text-gray-400 text-sm">No transactions yet. Add one to start tracking.</p>
          </div>
        </GlassCard>
      )}

      {showForm && (
        <TransactionForm
          initial={editing ?? undefined}
          onSave={draft => editing ? store.updateTransaction(editing.id, draft) : store.addTransaction(draft)}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          message="Delete this transaction?"
          onConfirm={() => { store.deleteTransaction(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
