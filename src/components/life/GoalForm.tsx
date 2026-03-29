import { useState, FormEvent } from 'react'
import type { Goal, GoalDraft, GoalStatus, Milestone } from '../../types'
import { PLAYBOOK_COLORS } from '../../constants'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface Props {
  initial?: Goal
  onSave: (draft: GoalDraft) => void
  onClose: () => void
}

export function GoalForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '')
  const [color, setColor] = useState(initial?.color ?? PLAYBOOK_COLORS[6])
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? 'active')
  const [milestones, setMilestones] = useState<Milestone[]>(
    initial?.milestones ?? []
  )
  const [error, setError] = useState('')

  const addMilestone = () => setMilestones([...milestones, { id: crypto.randomUUID(), label: '', done: false }])
  const updateMilestone = (i: number, label: string) =>
    setMilestones(milestones.map((m, j) => j === i ? { ...m, label } : m))
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, j) => j !== i))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    const validMilestones = milestones.filter(m => m.label.trim()).map(m => ({ ...m, label: m.label.trim() }))
    const doneCount = validMilestones.filter(m => m.done).length
    const progress = validMilestones.length ? Math.round(doneCount / validMilestones.length * 100) : (initial?.progress ?? 0)

    onSave({
      name: name.trim(),
      description: description.trim(),
      targetDate,
      color,
      status,
      progress,
      milestones: validMilestones,
    })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit Goal' : 'New Goal'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs text-down bg-down/10 rounded-lg px-3 py-2">{error}</p>}

        <Input label="Goal Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Run a marathon" />
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Why is this important?" rows={2} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Target Date" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value as GoalStatus)}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </Select>
        </div>

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

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-2">Milestones</label>
          <div className="flex flex-col gap-2">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex gap-2">
                <input
                  value={m.label}
                  onChange={e => updateMilestone(i, e.target.value)}
                  placeholder={`Milestone ${i + 1}`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent transition-all"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(i)}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addMilestone} className="self-start">
              + Add Milestone
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save' : 'Create Goal'}</Button>
        </div>
      </form>
    </Modal>
  )
}
