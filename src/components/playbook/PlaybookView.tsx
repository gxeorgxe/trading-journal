import { useState } from 'react'
import type { Playbook } from '../../types'
import type { UsePlaybooksReturn } from '../../hooks/usePlaybooks'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PlaybookForm } from './PlaybookForm'

interface Props {
  playbookStore: UsePlaybooksReturn
}

export function PlaybookView({ playbookStore }: Props) {
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook } = playbookStore
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Playbook | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">Playbooks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {playbooks.length} strategy {playbooks.length !== 1 ? 'playbooks' : 'playbook'}
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
          + New Playbook
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {playbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4 opacity-60">📋</div>
            <p className="text-gray-400 text-sm">No playbooks yet. Create one to grade your trades against your strategy rules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map(pb => (
              <GlassCard key={pb.id} hover padding="p-0" className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: pb.color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                      <h3 className="font-semibold text-gray-100 text-sm">{pb.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(pb); setShowForm(true) }} title="Edit">✏️</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(pb.id)} title="Delete">🗑️</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {pb.rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-gray-600 shrink-0">{i + 1}.</span>
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PlaybookForm
          initial={editing ?? undefined}
          onSave={draft => editing ? updatePlaybook(editing.id, draft) : addPlaybook(draft)}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          message="Delete this playbook? Existing trade grades will be preserved."
          onConfirm={() => { deletePlaybook(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
