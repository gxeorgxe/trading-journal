import { useCallback } from 'react'
import type { Playbook, PlaybookDraft } from '../types'
import { STORAGE_KEYS } from '../constants'
import { nowIso } from '../utils/dateUtils'
import { useSupabaseSync } from './useSupabaseSync'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UsePlaybooksReturn {
  playbooks: Playbook[]
  addPlaybook: (draft: PlaybookDraft) => void
  updatePlaybook: (id: string, draft: PlaybookDraft) => void
  deletePlaybook: (id: string) => void
}

function toCamel(row: any): Playbook {
  return {
    id: row.id,
    name: row.name,
    rules: row.rules ?? [],
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDb(pb: Playbook, userId: string): Record<string, any> {
  return {
    id: pb.id,
    user_id: userId,
    name: pb.name,
    rules: pb.rules,
    color: pb.color,
    created_at: pb.createdAt,
    updated_at: pb.updatedAt,
  }
}

export function usePlaybooks(): UsePlaybooksReturn {
  const sync = useSupabaseSync<Playbook>({
    table: 'playbooks',
    storageKey: STORAGE_KEYS.PLAYBOOKS,
    toCamel,
    toDb,
  })

  const playbooks = sync.data

  const addPlaybook = useCallback((draft: PlaybookDraft) => {
    const pb: Playbook = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    sync.add(pb)
  }, [sync])

  const updatePlaybook = useCallback((id: string, draft: PlaybookDraft) => {
    const existing = playbooks.find(p => p.id === id)
    const pb: Playbook = { ...draft, id, createdAt: existing?.createdAt ?? nowIso(), updatedAt: nowIso() }
    sync.update(id, pb)
  }, [sync, playbooks])

  const deletePlaybook = useCallback((id: string) => {
    sync.remove(id)
  }, [sync])

  return { playbooks, addPlaybook, updatePlaybook, deletePlaybook }
}
