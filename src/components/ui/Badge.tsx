interface Props {
  label: string
  onRemove?: () => void
  color?: 'default' | 'up' | 'down'
}

const colors = {
  default: 'bg-accent/15 text-accent border-accent/30',
  up: 'bg-up/15 text-up border-up/30',
  down: 'bg-down/15 text-down border-down/30',
}

export function Badge({ label, onRemove, color = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${colors[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 leading-none">&times;</button>
      )}
    </span>
  )
}
