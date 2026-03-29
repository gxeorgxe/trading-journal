import type { Playbook, PlaybookGrade } from '../../types'

interface Props {
  playbooks: Playbook[]
  value: PlaybookGrade | undefined
  onChange: (grade: PlaybookGrade | undefined) => void
}

export function PlaybookGradeInput({ playbooks, value, onChange }: Props) {
  if (playbooks.length === 0) return null

  const selected = value ? playbooks.find(p => p.id === value.playbookId) : null

  const handleSelect = (id: string) => {
    if (id === '') { onChange(undefined); return }
    const pb = playbooks.find(p => p.id === id)
    if (!pb) return
    onChange({ playbookId: id, rulesFollowed: pb.rules.map(() => false) })
  }

  const toggleRule = (i: number) => {
    if (!value) return
    const next = [...value.rulesFollowed]
    next[i] = !next[i]
    onChange({ ...value, rulesFollowed: next })
  }

  const followed = value ? value.rulesFollowed.filter(Boolean).length : 0
  const total = value ? value.rulesFollowed.length : 0

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-medium">Playbook</label>
      <select
        value={value?.playbookId ?? ''}
        onChange={e => handleSelect(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-accent transition-all cursor-pointer"
      >
        <option value="">None</option>
        {playbooks.map(pb => (
          <option key={pb.id} value={pb.id}>{pb.name}</option>
        ))}
      </select>

      {selected && value && (
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selected.color }} />
              <span className="text-xs font-medium text-gray-300">{selected.name}</span>
            </div>
            <span className={`text-xs font-bold ${followed === total ? 'text-up' : followed > 0 ? 'text-warn' : 'text-gray-500'}`}>
              {followed}/{total} ({total > 0 ? Math.round((followed / total) * 100) : 0}%)
            </span>
          </div>
          <div className="space-y-1.5">
            {selected.rules.map((rule, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.rulesFollowed[i] ?? false}
                  onChange={() => toggleRule(i)}
                  className="accent-accent w-3.5 h-3.5"
                />
                <span className={`text-xs transition-colors ${value.rulesFollowed[i] ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {rule}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
