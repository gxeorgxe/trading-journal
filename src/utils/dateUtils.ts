import { format, parseISO, isValid } from 'date-fns'

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDisplay(isoDate: string): string {
  try {
    const d = parseISO(isoDate)
    return isValid(d) ? format(d, 'dd MMM yyyy') : isoDate
  } catch {
    return isoDate
  }
}

export function nowIso(): string {
  return new Date().toISOString()
}
