import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts'
import type { GroupedStat } from '../../types'
import { GlassCard } from '../ui/GlassCard'

interface Props { data: GroupedStat[] }

export function PairBarChart({ data }: Props) {
  if (data.length === 0) return (
    <GlassCard className="flex items-center justify-center h-64">
      <p className="text-gray-600 text-sm">No data</p>
    </GlassCard>
  )

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">R by Pair</h3>
      <p className="text-xs text-gray-600 mb-4">Total R earned per currency pair</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="pairGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="pairRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={true} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R`} width={40} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as GroupedStat
              return (
                <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
                  <p className="text-xs font-medium text-gray-200">{d.label}</p>
                  <p className={`text-xs font-semibold ${d.totalR >= 0 ? 'text-up' : 'text-down'}`}>
                    {d.totalR > 0 ? '+' : ''}{d.totalR.toFixed(2)}R
                  </p>
                  <p className="text-xs text-gray-500">{d.count} trades, {(d.winRate * 100).toFixed(0)}% WR</p>
                </div>
              )
            }}
          />
          <ReferenceLine y={0} stroke="#4b5563" />
          <Bar dataKey="totalR" radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.totalR >= 0 ? 'url(#pairGreen)' : 'url(#pairRed)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
