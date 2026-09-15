import { daysInMonth, mondayFirstIndex, monthLabel, toDateKey } from '../lib/date'

interface DayCell {
  color: string
}

interface Props {
  year: number
  month: number
  cellFor: (dateKey: string) => DayCell
  onDayClick: (dateKey: string) => void
}

const WEEKDAY_HEADERS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function MonthGridBox({ year, month, cellFor, onDayClick }: Props) {
  const totalDays = daysInMonth(year, month)
  const leadingBlanks = mondayFirstIndex(new Date(year, month, 1))
  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => toDateKey(new Date(year, month, i + 1))),
  ]

  return (
    <div className="w-full max-w-xs rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{monthLabel(year, month)}</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_HEADERS.map((label) => (
          <div key={label} className="text-center text-[10px] font-medium text-slate-500">
            {label}
          </div>
        ))}
        {cells.map((dateKey, idx) => {
          if (!dateKey) return <div key={`blank-${idx}`} />
          const { color } = cellFor(dateKey)
          const dayNumber = Number(dateKey.slice(-2))
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDayClick(dateKey)}
              style={{ backgroundColor: color }}
              title={dateKey}
              className="flex aspect-square items-center justify-center rounded-md text-[11px] font-medium text-white/90 transition hover:ring-2 hover:ring-white/40"
            >
              {dayNumber}
            </button>
          )
        })}
      </div>
    </div>
  )
}
