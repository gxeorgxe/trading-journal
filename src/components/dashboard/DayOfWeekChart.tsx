import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts'
import type { DayOfWeekStat } from '../../types'
import { GlassCard } from '../ui/GlassCard'

interface Props { data: DayOfWeekStat[] }

export function DayOfWeekChart({ data }: Props) {
  if (data.every(d => d.count === 0)) return null

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">Avg R by Day</h3>
      <p className="text-xs text-gray-600 mb-4">Average R per day of week</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R`} width={40} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as DayOfWeekStat
              return (
                <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
                  <p className="text-xs font-medium text-gray-200">{d.day}</p>
                  <p className={`text-xs font-semibold ${d.avgR >= 0 ? 'text-up' : 'text-down'}`}>{d.avgR > 0 ? '+' : ''}{d.avgR.toFixed(2)}R avg</p>
                  <p className="text-xs text-gray-500">{d.count} trades, {(d.winRate * 100).toFixed(0)}% WR</p>
                </div>
              )
            }}
          />
          <ReferenceLine y={0} stroke="#4b5563" />
          <Bar dataKey="avgR" radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((entry, i) => <Cell key={i} fill={entry.avgR >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={entry.count > 0 ? 0.8 : 0.2} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
