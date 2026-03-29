import { InputHTMLAttributes, forwardRef } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = '', ...rest }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <input
      ref={ref}
      className={`bg-white/5 border ${error ? 'border-down' : 'border-white/10'} rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent focus:shadow-glow transition-all ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-down">{error}</p>}
  </div>
))
Input.displayName = 'Input'
