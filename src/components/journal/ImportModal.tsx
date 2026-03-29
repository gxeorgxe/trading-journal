import { useState, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Trade } from '../../types'
import {
  parseSpreadsheet,
  autoDetectMapping,
  convertToTrades,
  type ColumnMapping,
  type ParsedSheet,
  type ImportResult,
} from '../../utils/excelImport'

interface Props {
  onImport: (trades: Trade[], replace: boolean) => void
  onClose: () => void
}

type Step = 'upload' | 'map' | 'review'

const TRADE_FIELDS: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
  { key: 'date', label: 'Date', required: true },
  { key: 'pair', label: 'Pair / Symbol', required: true },
  { key: 'r', label: 'R (Risk Reward)', required: true },
  { key: 'direction', label: 'Direction', required: false },
  { key: 'session', label: 'Session', required: false },
  { key: 'entryTime', label: 'Entry Time', required: false },
  { key: 'tags', label: 'Tags', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

export function ImportModal({ onImport, onClose }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '', pair: '', entryTime: '', r: '', direction: '', session: '', tags: '', notes: '',
  })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [replace, setReplace] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const parsed = await parseSpreadsheet(file)
      if (parsed.rows.length === 0) {
        setError('No data found in file.')
        setLoading(false)
        return
      }
      setSheet(parsed)
      setFileName(file.name)
      const detected = autoDetectMapping(parsed.headers)
      setMapping(prev => ({ ...prev, ...detected }))
      setStep('map')
    } catch {
      setError('Failed to parse file. Make sure it\'s a valid Excel or CSV file.')
    }
    setLoading(false)
    e.target.value = ''
  }

  const handleMap = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }))
  }

  const proceedToReview = () => {
    if (!sheet) return
    const res = convertToTrades(sheet.rows, mapping)
    setResult(res)
    setStep('review')
  }

  const handleImport = () => {
    if (!result || result.valid.length === 0) return
    onImport(result.valid, replace)
    onClose()
  }

  const canProceedToReview = mapping.date && mapping.pair && mapping.r

  return (
    <Modal title="Import Trades" onClose={onClose} size="xl">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['upload', 'map', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-accent text-white' : i < ['upload', 'map', 'review'].indexOf(step) ? 'bg-accent/30 text-accent' : 'bg-white/5 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === s ? 'text-gray-200' : 'text-gray-500'}`}>
              {s === 'upload' ? 'Upload' : s === 'map' ? 'Map Columns' : 'Review'}
            </span>
            {i < 2 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div
            className="w-full border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-accent/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-3xl mb-3">📁</div>
            <p className="text-sm text-gray-300 font-medium mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">Supports .xlsx, .xls, .csv files</p>
          </div>
          {loading && <p className="text-xs text-gray-400">Parsing file...</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 'map' && sheet && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-200 font-medium">{fileName}</p>
              <p className="text-xs text-gray-500">{sheet.rows.length} rows found &middot; {sheet.headers.length} columns</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>Change file</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {TRADE_FIELDS.map(({ key, label, required }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <select
                  value={mapping[key]}
                  onChange={e => handleMap(key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/50"
                >
                  <option value="">— skip —</option>
                  {sheet.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">Preview (first 3 rows)</p>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {TRADE_FIELDS.filter(f => mapping[f.key]).map(f => (
                      <th key={f.key} className="px-3 py-2 text-left text-gray-400 font-medium">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {TRADE_FIELDS.filter(f => mapping[f.key]).map(f => (
                        <td key={f.key} className="px-3 py-2 text-gray-300">{row[mapping[f.key]] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setStep('upload')}>Back</Button>
            <Button size="sm" disabled={!canProceedToReview} onClick={proceedToReview}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Import */}
      {step === 'review' && result && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{result.valid.length}</p>
              <p className="text-xs text-gray-400 mt-1">Valid trades</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
              <p className="text-xs text-gray-400 mt-1">Skipped (errors)</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2 font-medium">Errors (rows skipped)</p>
              <div className="max-h-32 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-3 space-y-1">
                {result.errors.slice(0, 20).map((e, i) => (
                  <p key={i} className="text-xs text-red-400/80">
                    Row {e.row}: {e.reason}
                  </p>
                ))}
                {result.errors.length > 20 && (
                  <p className="text-xs text-gray-500">...and {result.errors.length - 20} more</p>
                )}
              </div>
            </div>
          )}

          {result.valid.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2 font-medium">Preview</p>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">Date</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">Pair</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">R</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">Direction</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.valid.slice(0, 5).map((t, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-3 py-2 text-gray-300">{t.date}</td>
                        <td className="px-3 py-2 text-gray-300">{t.pair}</td>
                        <td className={`px-3 py-2 font-medium ${t.r >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {t.r >= 0 ? '+' : ''}{t.r}R
                        </td>
                        <td className="px-3 py-2 text-gray-300">{t.direction}</td>
                        <td className="px-3 py-2 text-gray-300">{t.session}</td>
                      </tr>
                    ))}
                    {result.valid.length > 5 && (
                      <tr><td colSpan={5} className="px-3 py-2 text-gray-500 text-center">...and {result.valid.length - 5} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 bg-white/5 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={replace}
                onChange={e => setReplace(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-xs text-gray-300">Replace all existing trades</span>
            </label>
            {replace && <span className="text-xs text-yellow-400">⚠ This will delete your current trades</span>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setStep('map')}>Back</Button>
            <Button size="sm" disabled={result.valid.length === 0} onClick={handleImport}>
              Import {result.valid.length} Trade{result.valid.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
