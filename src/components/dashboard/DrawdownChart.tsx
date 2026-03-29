import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { DrawdownPoint } from '../../types'
import { formatDisplay } from '../../utils/dateUtils'
import { GlassCard } from '../ui/GlassCard'

interface Props { data: DrawdownPoint[] }

export function DrawdownChart({ data }: Props) {
  if (data.length === 0) return null

  const maxDD = Math.min(...data.map(d => d.drawdown))
  if (maxDD === 0) return null

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Drawdown from Peak</h3>
        <span className="text-xs font-bold text-down">{maxDD.toFixed(2)}R max</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => formatDisplay(d).slice(0, 6)} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R`} width={40} domain={['dataMin', 0]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const v = payload[0].value as number
              return (
                <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
                  <p className="text-xs text-gray-400">{formatDisplay(String(label))}</p>
                  <p className="text-xs font-semibold text-down">{v.toFixed(2)}R</p>
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#drawdownGrad)" animationDuration={1000} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
