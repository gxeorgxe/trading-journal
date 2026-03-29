import * as XLSX from 'xlsx'
import type { Trade } from '../types'

export interface ColumnMapping {
  date: string
  pair: string
  entryTime: string
  r: string
  direction: string
  session: string
  tags: string
  notes: string
}

export interface ParsedSheet {
  headers: string[]
  rows: Record<string, string>[]
}

export interface ImportResult {
  valid: Trade[]
  errors: { row: number; reason: string }[]
}

/** Parse an Excel/CSV file and return headers + rows from the first sheet */
export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array', cellDates: true })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  if (json.length === 0) return { headers: [], rows: [] }

  const headers = Object.keys(json[0])
  const rows = json.map(row => {
    const mapped: Record<string, string> = {}
    for (const h of headers) {
      const val = row[h]
      if (val instanceof Date) {
        mapped[h] = formatDate(val)
      } else {
        mapped[h] = String(val ?? '')
      }
    }
    return mapped
  })

  return { headers, rows }
}

/** Try to auto-detect column mapping from header names */
export function autoDetectMapping(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {}
  const lower = headers.map(h => h.toLowerCase().trim())

  const find = (patterns: string[]): string | undefined => {
    for (const p of patterns) {
      const idx = lower.findIndex(h => h === p || h.includes(p))
      if (idx !== -1) return headers[idx]
    }
    return undefined
  }

  mapping.date = find(['date', 'trade date', 'entry date', 'open date'])
  mapping.pair = find(['pair', 'symbol', 'ticker', 'instrument', 'asset', 'market'])
  mapping.entryTime = find(['entry time', 'time', 'entry', 'open time'])
  mapping.r = find(['r', 'r:r', 'risk reward', 'r multiple', 'rr', 'profit', 'pnl', 'p&l', 'result'])
  mapping.direction = find(['direction', 'side', 'long/short', 'type', 'position'])
  mapping.session = find(['session', 'market session'])
  mapping.tags = find(['tags', 'tag', 'labels', 'category', 'setup'])
  mapping.notes = find(['notes', 'note', 'comments', 'comment', 'description'])

  return mapping
}

/** Convert mapped rows into Trade objects */
export function convertToTrades(rows: Record<string, string>[], mapping: ColumnMapping): ImportResult {
  const valid: Trade[] = []
  const errors: { row: number; reason: string }[] = []
  const now = new Date().toISOString()

  rows.forEach((row, i) => {
    const rowNum = i + 2 // +2 for 1-indexed + header row
    const reasons: string[] = []

    // Date (required)
    const rawDate = mapping.date ? row[mapping.date]?.trim() : ''
    const date = parseDate(rawDate)
    if (!date) reasons.push('Invalid or missing date')

    // Pair (required)
    const pair = mapping.pair ? row[mapping.pair]?.trim().toUpperCase() : ''
    if (!pair) reasons.push('Missing pair/symbol')

    // R (required)
    const rawR = mapping.r ? row[mapping.r]?.trim() : ''
    const r = parseNumber(rawR)
    if (r === null) reasons.push('Invalid or missing R value')

    if (reasons.length > 0) {
      errors.push({ row: rowNum, reason: reasons.join('; ') })
      return
    }

    // Optional fields
    const entryTime = mapping.entryTime ? parseTime(row[mapping.entryTime]?.trim()) : ''
    const direction = mapping.direction ? parseDirection(row[mapping.direction]?.trim()) : 'Long'
    const session = mapping.session ? parseSession(row[mapping.session]?.trim()) : 'London'
    const tags = mapping.tags ? parseTags(row[mapping.tags]?.trim()) : []
    const notes = mapping.notes ? row[mapping.notes]?.trim() ?? '' : ''

    valid.push({
      id: crypto.randomUUID(),
      date: date!,
      pair,
      entryTime,
      r: r!,
      direction,
      session,
      tags,
      notes,
      screenshots: [],
      createdAt: now,
      updatedAt: now,
    })
  })

  return { valid, errors }
}

// ── Helpers ──

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDate(raw: string): string | null {
  if (!raw) return null

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  // MM/DD/YYYY or M/D/YYYY
  const slash = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (slash) {
    const [, m, d, y] = slash
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // DD/MM/YYYY variant — try to parse via Date
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return formatDate(d)

  return null
}

function parseNumber(raw: string): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/[$,R]/g, '').trim()
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

function parseTime(raw: string): string {
  if (!raw) return ''
  // HH:MM already
  if (/^\d{1,2}:\d{2}$/.test(raw)) return raw.padStart(5, '0')
  // Try to extract time from datetime string
  const match = raw.match(/(\d{1,2}):(\d{2})/)
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
  return ''
}

function parseDirection(raw: string): 'Long' | 'Short' {
  const l = raw.toLowerCase()
  if (l.includes('short') || l === 's' || l === 'sell') return 'Short'
  return 'Long'
}

function parseSession(raw: string): 'London' | 'NY' | 'Asia' {
  const l = raw.toLowerCase()
  if (l.includes('ny') || l.includes('new york') || l.includes('us')) return 'NY'
  if (l.includes('asia') || l.includes('tokyo') || l.includes('sydney')) return 'Asia'
  return 'London'
}

function parseTags(raw: string): string[] {
  if (!raw) return []
  return raw.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
}
