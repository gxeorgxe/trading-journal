import { useRef, useState } from 'react'
import { compressImageToBase64 } from '../../utils/imageUtils'
import { Modal } from '../ui/Modal'

interface Props {
  value: string[]
  onChange: (screenshots: string[]) => void
}

export function ScreenshotUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    setLoading(true)
    try {
      const compressed = await Promise.all(
        Array.from(files).slice(0, 5 - value.length).map(f => compressImageToBase64(f))
      )
      onChange([...value, ...compressed])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-medium">Screenshots</label>
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={i} className="relative group">
            <img
              src={src}
              alt={`screenshot ${i + 1}`}
              className="w-20 h-16 object-cover rounded-lg border border-surface-border cursor-pointer hover:border-accent transition-colors"
              onClick={() => setLightbox(src)}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-down rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {value.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-20 h-16 rounded-lg border-2 border-dashed border-surface-border hover:border-accent text-gray-600 hover:text-accent transition-colors flex flex-col items-center justify-center text-xs"
          >
            {loading ? '...' : <><span className="text-xl leading-none">+</span>Add</>}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {lightbox && (
        <Modal title="Screenshot" onClose={() => setLightbox(null)} size="xl">
          <img src={lightbox} alt="screenshot" className="w-full rounded-lg" />
        </Modal>
      )}
    </div>
  )
}
