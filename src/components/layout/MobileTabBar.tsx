import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/journal', label: 'Journal', icon: '📒' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/playbooks', label: 'Playbooks', icon: '📋' },
  { to: '/life', label: 'Life', icon: '🌱' },
]

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/5 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-2 px-4">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-gray-500'
            }`
          }
        >
          <span className="text-lg">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
