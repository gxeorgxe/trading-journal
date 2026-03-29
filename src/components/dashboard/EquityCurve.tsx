import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts'
import type { EquityPoint } from '../../types'
import { formatDisplay } from '../../utils/dateUtils'
import { GlassCard } from '../ui/GlassCard'

interface Props { data: EquityPoint[] }

export function EquityCurve({ data }: Props) {
  if (data.length === 0) return (
    <GlassCard className="flex items-center justify-center h-[320px]">
      <p className="text-gray-600 text-sm">Add trades to see your equity curve</p>
    </GlassCard>
  )

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Equity Curve</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDisplay(d).slice(0, 6)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}R`}
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const v = payload[0].value as number
              return (
                <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
                  <p className="text-xs text-gray-400">{formatDisplay(String(label))}</p>
                  <p className="text-xs font-semibold text-accent">{v > 0 ? '+' : ''}{v.toFixed(2)}R</p>
                </div>
              )
            }}
          />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 2" />
          <Area
            type="monotone"
            dataKey="cumR"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#equityGradient)"
            animationDuration={1200}
            dot={data.length <= 30 ? { fill: '#6366f1', r: 3, strokeWidth: 0 } : false}
            activeDot={{ r: 5, fill: '#6366f1', stroke: '#6366f140', strokeWidth: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
