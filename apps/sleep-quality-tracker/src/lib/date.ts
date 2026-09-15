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

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 0 = Montag ... 6 = Sonntag (im Unterschied zu Date#getDay, das bei Sonntag beginnt) */
export function mondayFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

/** Die letzten `count` Monate inkl. des aktuellen, neuester zuerst */
export function recentMonths(count: number, from: Date = new Date()): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth() })
  }
  return result
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
