import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'
import type { PlaybookStat } from '../../types'
import { GlassCard } from '../ui/GlassCard'

interface Props { data: PlaybookStat[] }

export function PlaybookDashboard({ data }: Props) {
  if (data.length === 0) return null

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">Playbook Performance</h3>
      <p className="text-xs text-gray-600 mb-4">Win rate and rule adherence by strategy</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Win Rate by Playbook</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="playbookName" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v * 100)}%`} domain={[0, 1]} width={40} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as PlaybookStat
                  return (
                    <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
                      <p className="text-xs font-medium text-gray-200">{d.playbookName}</p>
                      <p className="text-xs text-gray-400">{d.count} trades, {(d.winRate * 100).toFixed(0)}% WR</p>
                      <p className="text-xs text-gray-400">Adherence: {(d.avgAdherence * 100).toFixed(0)}%</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Stats</p>
          <div className="space-y-3">
            {data.map(d => (
              <div key={d.playbookId} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{d.playbookName}</p>
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span>{d.count} trades</span>
                    <span className={d.totalR > 0 ? 'text-up' : 'text-down'}>{d.totalR > 0 ? '+' : ''}{d.totalR.toFixed(2)}R</span>
                    <span>Adherence: {(d.avgAdherence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
