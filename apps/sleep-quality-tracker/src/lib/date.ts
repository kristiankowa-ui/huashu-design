export const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Liste von Datums-Keys, neuestes zuerst */
export function lastNDays(n: number, from: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = 0; i < n; i++) {
    keys.push(toDateKey(addDays(from, -i)))
  }
  return keys
}

export function formatDisplayDate(key: string): string {
  const d = parseDateKey(key)
  const weekday = WEEKDAY_LABELS[d.getDay()]
  return `${weekday}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
}

export function formatMinutes(min: number | null): string {
  if (min === null || Number.isNaN(min)) return '–'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${h}h ${m}min`
}
