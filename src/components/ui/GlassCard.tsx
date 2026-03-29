import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  padding?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', padding = 'p-5', hover = false }: Props) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl ${padding} ${hover ? 'transition-shadow hover:shadow-glow' : ''} ${className}`}>
      {children}
    </div>
  )
}
