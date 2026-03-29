import type { TooltipProps } from 'recharts'

interface Props extends TooltipProps<number, string> {
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number, name: string) => string
}

export function GlassTooltip({ active, payload, label, labelFormatter, valueFormatter }: Props) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-surface-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl px-3 py-2">
      {label && (
        <p className="text-xs text-gray-400 mb-1">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: entry.color }}>
          {valueFormatter
            ? valueFormatter(entry.value as number, entry.name ?? '')
            : `${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  )
}
