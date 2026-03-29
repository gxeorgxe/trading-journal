import { useState, FormEvent } from 'react'
import type { Trade, TradeDraft, Playbook, PlaybookGrade } from '../../types'
import { SESSIONS, DIRECTIONS, DEFAULT_PAIRS } from '../../constants'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { TagInput } from '../ui/TagInput'
import { ScreenshotUpload } from './ScreenshotUpload'
import { PlaybookGradeInput } from '../playbook/PlaybookGradeInput'
import { today } from '../../utils/dateUtils'

interface Props {
  initial?: Trade
  onSave: (draft: TradeDraft) => void
  onClose: () => void
  allTags: string[]
  allPairs: string[]
  playbooks: Playbook[]
}

interface Errors { date?: string; pair?: string; r?: string; direction?: string; session?: string }

export function TradeForm({ initial, onSave, onClose, allTags, allPairs, playbooks }: Props) {
  const [date, setDate] = useState(initial?.date ?? today())
  const [pair, setPair] = useState(initial?.pair ?? '')
  const [entryTime, setEntryTime] = useState(initial?.entryTime ?? '')
  const [r, setR] = useState(initial?.r.toString() ?? '')
  const [direction, setDirection] = useState<Trade['direction']>(initial?.direction ?? 'Long')
  const [session, setSession] = useState<Trade['session']>(initial?.session ?? 'London')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [screenshots, setScreenshots] = useState<string[]>(initial?.screenshots ?? [])
  const [playbookGrade, setPlaybookGrade] = useState<PlaybookGrade | undefined>(initial?.playbookGrade)
  const [errors, setErrors] = useState<Errors>({})

  const pairs = [...new Set([...DEFAULT_PAIRS, ...allPairs, pair].filter(Boolean))].sort()

  const validate = (): boolean => {
    const e: Errors = {}
    if (!date) e.date = 'Required'
    if (!pair.trim()) e.pair = 'Required'
    if (r === '' || isNaN(Number(r)) || !isFinite(Number(r))) e.r = 'Enter a valid number (e.g. 2.5 or -1)'
    if (!direction) e.direction = 'Required'
    if (!session) e.session = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({ date, pair: pair.toUpperCase().trim(), entryTime, r: Number(r), direction, session, tags, notes, screenshots, playbookGrade })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit Trade' : 'Add Trade'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} error={errors.date} required />
          <Input label="Entry Time" type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Pair {errors.pair && <span className="text-down ml-1">{errors.pair}</span>}</label>
            <input
              list="pairs-list"
              value={pair}
              onChange={e => setPair(e.target.value)}
              placeholder="e.g. EURUSD"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent focus:shadow-glow transition-all uppercase"
            />
            <datalist id="pairs-list">
              {pairs.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>
          <Input
            label={`R Value ${errors.r ? '— ' + errors.r : ''}`}
            type="number"
            step="0.1"
            value={r}
            onChange={e => setR(e.target.value)}
            placeholder="e.g. 2.5 or -1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Direction" value={direction} onChange={e => setDirection(e.target.value as Trade['direction'])} error={errors.direction}>
            {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
          </Select>
          <Select label="Session" value={session} onChange={e => setSession(e.target.value as Trade['session'])} error={errors.session}>
            {SESSIONS.map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>

        <PlaybookGradeInput playbooks={playbooks} value={playbookGrade} onChange={setPlaybookGrade} />
        <TagInput label="Setup Tags" value={tags} onChange={setTags} suggestions={allTags} />
        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Trade notes…" maxLength={2000} />
        <ScreenshotUpload value={screenshots} onChange={setScreenshots} />

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save Changes' : 'Add Trade'}</Button>
        </div>
      </form>
    </Modal>
  )
}
