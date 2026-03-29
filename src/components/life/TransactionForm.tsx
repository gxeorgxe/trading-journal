import { useState, FormEvent } from 'react'
import type { Transaction, TransactionDraft, TransactionType } from '../../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { today } from '../../utils/dateUtils'

interface Props {
  initial?: Transaction
  onSave: (draft: TransactionDraft) => void
  onClose: () => void
}

export function TransactionForm({ initial, onSave, onClose }: Props) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [date, setDate] = useState(initial?.date ?? today())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return }
    if (!category) { setError('Select a category'); return }
    onSave({ type, amount: amt, category, date, notes: notes.trim() })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose} size="md">
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs text-down bg-down/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                type === t
                  ? t === 'income' ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <Select label="Category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select category...</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save' : 'Add'}</Button>
        </div>
      </form>
    </Modal>
  )
}
