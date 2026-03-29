import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white hover:shadow-glow',
  secondary: 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10',
  danger: 'bg-down/10 hover:bg-down/20 text-down border border-down/30',
  ghost: 'hover:bg-surface-hover text-gray-400 hover:text-gray-200',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
