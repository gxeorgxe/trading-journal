import { useState } from 'react'
import type { Trade, Playbook } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDisplay } from '../../utils/dateUtils'
import { formatR } from '../../utils/analytics'

interface Props {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
  playbooks: Playbook[]
}

export function TradeCardMobile({ trades, onEdit, onDelete, playbooks }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3 p-4">
      {trades.map(t => {
        const expanded = expandedId === t.id
        const pb = t.playbookGrade ? playbooks.find(p => p.id === t.playbookGrade!.playbookId) : undefined
        const followed = t.playbookGrade?.rulesFollowed.filter(Boolean).length ?? 0
        const totalRules = t.playbookGrade?.rulesFollowed.length ?? 0
        return (
          <GlassCard key={t.id} padding="p-0" className={`overflow-hidden border-l-4 ${t.r > 0 ? 'border-l-up' : t.r < 0 ? 'border-l-down' : 'border-l-gray-600'}`}>
            <div
              className="px-4 py-3 cursor-pointer"
              onClick={() => setExpandedId(expanded ? null : t.id)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-gray-100">{t.pair}</span>
                <span className={`font-bold tabular-nums ${t.r > 0 ? 'text-up' : t.r < 0 ? 'text-down' : 'text-gray-400'}`}>
                  {formatR(t.r)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDisplay(t.date)}</span>
                {t.entryTime && <span>{t.entryTime}</span>}
                <Badge label={t.direction} color={t.direction === 'Long' ? 'up' : 'down'} />
                {pb && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                    {pb.name}
                  </span>
                )}
                <span className="ml-auto">{t.session}</span>
              </div>
            </div>
            {expanded && (
              <div className="animate-slide-up border-t border-white/5 px-4 py-3 space-y-3">
                {pb && totalRules > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                    <span className="text-xs text-gray-300 font-medium">{pb.name}</span>
                    <span className={`text-[10px] font-medium ${followed === totalRules ? 'text-up' : followed > 0 ? 'text-warn' : 'text-gray-500'}`}>
                      {followed}/{totalRules} rules ({Math.round(followed / totalRules * 100)}%)
                    </span>
                  </div>
                )}
                {t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map(tag => <Badge key={tag} label={tag} />)}
                  </div>
                )}
                {t.notes && <p className="text-xs text-gray-300 whitespace-pre-wrap">{t.notes}</p>}
                {t.screenshots.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {t.screenshots.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-20 h-14 object-cover rounded-lg border border-white/10" />
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(t)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(t.id)}>Delete</Button>
                </div>
              </div>
            )}
          </GlassCard>
        )
      })}
    </div>
  )
}
