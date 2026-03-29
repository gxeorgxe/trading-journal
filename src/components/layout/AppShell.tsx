import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { StorageBanner } from './StorageBanner'
import { MobileTabBar } from './MobileTabBar'

export function AppShell() {
  return (
    <div className="flex h-screen bg-surface text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StorageBanner />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  )
}
