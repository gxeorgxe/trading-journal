import type { MigrationProgress } from '../../utils/migrateLocalData'

interface Props {
  progress: MigrationProgress | null
}

export function MigrationBanner({ progress }: Props) {
  if (!progress) return null

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card/90 backdrop-blur-2xl border border-white/10 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-3xl mb-4">☁️</div>
        <h3 className="text-base font-semibold text-gray-100 mb-2">Migrating your data</h3>
        <p className="text-xs text-gray-400 mb-4">
          {progress.step}... ({progress.current}/{progress.total})
        </p>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">Please don't close the app</p>
      </div>
    </div>
  )
}
