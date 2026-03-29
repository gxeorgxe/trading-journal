import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { AppShell } from './components/layout/AppShell'
import { MigrationBanner } from './components/layout/MigrationBanner'
import { JournalView } from './components/journal/JournalView'
import { DashboardView } from './components/dashboard/DashboardView'
import { PlaybookView } from './components/playbook/PlaybookView'
import { LifeView } from './components/life/LifeView'
import { useTrades } from './hooks/useTrades'
import { useFilters } from './hooks/useFilters'
import { usePlaybooks } from './hooks/usePlaybooks'
import { migrateLocalDataToSupabase, hasMigrated, type MigrationProgress } from './utils/migrateLocalData'

function AuthenticatedApp() {
  const { user } = useAuth()
  const [migrating, setMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null)

  useEffect(() => {
    if (!user || hasMigrated()) return

    setMigrating(true)
    migrateLocalDataToSupabase(user.id, setMigrationProgress)
      .catch(err => console.error('Migration error:', err))
      .finally(() => {
        setMigrating(false)
        setMigrationProgress(null)
      })
  }, [user])

  const tradeStore = useTrades()
  const filterStore = useFilters(tradeStore.trades)
  const playbookStore = usePlaybooks()

  if (migrating) {
    return <MigrationBanner progress={migrationProgress} />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/journal" replace />} />
        <Route path="/journal" element={<JournalView tradeStore={tradeStore} filterStore={filterStore} playbooks={playbookStore.playbooks} />} />
        <Route path="/dashboard" element={<DashboardView tradeStore={tradeStore} filterStore={filterStore} playbooks={playbookStore.playbooks} />} />
        <Route path="/playbooks" element={<PlaybookView playbookStore={playbookStore} />} />
        <Route path="/life" element={<LifeView />} />
      </Route>
    </Routes>
  )
}

function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">📈</div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <AuthenticatedApp />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}
