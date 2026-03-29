import { useState, FormEvent } from 'react'
import type { Habit, HabitDraft } from '../../types'
import { PLAYBOOK_COLORS } from '../../constants'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  initial?: Habit
  onSave: (draft: HabitDraft) => void
  onClose: () => void
}

export function HabitForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? PLAYBOOK_COLORS[0])
  const [targetFrequency, setTargetFrequency] = useState(initial?.targetFrequency?.toString() ?? '')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    onSave({
      name: name.trim(),
      color,
      targetFrequency: targetFrequency ? parseInt(targetFrequency) : undefined,
    })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit Habit' : 'New Habit'} onClose={onClose} size="md">
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs text-down bg-down/10 rounded-lg px-3 py-2">{error}</p>}

        <Input label="Habit Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gym, Reading, Meditation" />

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PLAYBOOK_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Input
          label="Target (days per week)"
          type="number"
          value={targetFrequency}
          onChange={e => setTargetFrequency(e.target.value)}
          placeholder="e.g. 5"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save' : 'Create Habit'}</Button>
        </div>
      </form>
    </Modal>
  )
}
