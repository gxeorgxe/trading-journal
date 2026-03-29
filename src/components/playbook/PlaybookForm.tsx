import { useState, FormEvent } from 'react'
import type { Playbook, PlaybookDraft } from '../../types'
import { PLAYBOOK_COLORS } from '../../constants'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  initial?: Playbook
  onSave: (draft: PlaybookDraft) => void
  onClose: () => void
}

export function PlaybookForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? PLAYBOOK_COLORS[0])
  const [rules, setRules] = useState<string[]>(initial?.rules ?? [''])
  const [error, setError] = useState('')

  const addRule = () => setRules([...rules, ''])
  const updateRule = (i: number, v: string) => setRules(rules.map((r, j) => j === i ? v : r))
  const removeRule = (i: number) => {
    const next = rules.filter((_, j) => j !== i)
    setRules(next)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = rules.map(r => r.trim()).filter(Boolean)
    if (!name.trim()) { setError('Name is required'); return }
    onSave({ name: name.trim(), color, rules: trimmed })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit Playbook' : 'New Playbook'} onClose={onClose} size="md">
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs text-down bg-down/10 rounded-lg px-3 py-2">{error}</p>}

        <Input label="Playbook Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BOS Long Setup" />

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
          <label className="text-xs text-gray-400 font-medium block mb-2">Rules</label>
          <div className="flex flex-col gap-2">
            {rules.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={r}
                  onChange={e => updateRule(i, e.target.value)}
                  placeholder={`Rule ${i + 1}`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent transition-all"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRule(i)}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addRule} className="self-start">
              + Add Rule
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save' : 'Create Playbook'}</Button>
        </div>
      </form>
    </Modal>
  )
}
