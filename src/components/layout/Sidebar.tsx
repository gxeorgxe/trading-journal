import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const links = [
  { to: '/journal', label: 'Journal', icon: '📒' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/playbooks', label: 'Playbooks', icon: '📋' },
  { to: '/life', label: 'Life', icon: '🌱' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-56 shrink-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex-col hidden md:flex">
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">TradingJournal</span>
        </div>
      </div>
      <nav className="p-3 flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-accent shadow-glow'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Sign Out */}
      <div className="p-3 border-t border-white/10">
        {user && (
          <p className="text-xs text-gray-500 truncate px-3 mb-2" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-all"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
