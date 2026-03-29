import { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className = '', children, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
      <select
        className={`bg-white/5 border ${error ? 'border-down' : 'border-white/10'} rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-accent focus:shadow-glow transition-all cursor-pointer ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-down">{error}</p>}
    </div>
  )
}
