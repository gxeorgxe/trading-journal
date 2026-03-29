import { useEffect, useState } from 'react'
import { getStorageSizeBytes } from '../../utils/storage'
import { STORAGE_WARN_BYTES } from '../../constants'

export function StorageBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => setShow(getStorageSizeBytes() > STORAGE_WARN_BYTES)
    check()
    window.addEventListener('storage', check)
    return () => window.removeEventListener('storage', check)
  }, [])

  if (!show) return null

  return (
    <div className="bg-warn/10 border-b border-warn/30 px-4 py-2 text-xs text-warn flex items-center gap-2">
      <span>⚠️</span>
      Storage is above 4 MB — consider exporting and cleaning up old trades.
    </div>
  )
}
