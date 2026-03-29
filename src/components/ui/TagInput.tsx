import { useState, KeyboardEvent } from 'react'
import { Badge } from './Badge'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  label?: string
}

export function TagInput({ value, onChange, suggestions = [], label }: Props) {
  const [input, setInput] = useState('')

  const commit = () => {
    const tag = input.trim().replace(/,/g, '').toUpperCase()
    if (tag && !value.includes(tag) && value.length < 10) {
      onChange([...value, tag])
    }
    setInput('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const filtered = suggestions.filter(s => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
      <div className="bg-surface border border-surface-border rounded-lg px-3 py-2 flex flex-wrap gap-1.5 min-h-[40px] focus-within:border-accent transition-colors">
        {value.map(tag => (
          <Badge key={tag} label={tag} onRemove={() => onChange(value.filter(t => t !== tag))} />
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={value.length === 0 ? 'Type and press Enter…' : ''}
          className="bg-transparent text-sm text-gray-100 placeholder-gray-600 focus:outline-none flex-1 min-w-[120px]"
        />
      </div>
      {filtered.length > 0 && input && (
        <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden shadow-lg">
          {filtered.slice(0, 6).map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={e => { e.preventDefault(); onChange([...value, s]); setInput('') }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-surface-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
