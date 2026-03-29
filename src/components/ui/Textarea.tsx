import { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
      <textarea
        className={`bg-white/5 border ${error ? 'border-down' : 'border-white/10'} rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent focus:shadow-glow transition-all resize-y min-h-[80px] ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-down">{error}</p>}
    </div>
  )
}
