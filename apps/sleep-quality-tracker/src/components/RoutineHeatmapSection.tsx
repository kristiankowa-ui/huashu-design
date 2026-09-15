import type { DayEntry, RoutineItem } from '../types'
import MonthGridBox from './MonthGridBox'
import { parseDateKey, recentMonths, toDateKey } from '../lib/date'
import {
  ROUTINE_DONE_COLOR,
  ROUTINE_FUTURE_COLOR,
  ROUTINE_MISSED_COLOR,
  ROUTINE_NOT_SCHEDULED_COLOR,
} from '../lib/color'

interface Props {
  months: number
  routines: RoutineItem[]
  days: Record<string, DayEntry>
  onDayClick: (date: string) => void
}

function RoutineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ROUTINE_DONE_COLOR }} /> erledigt
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ROUTINE_MISSED_COLOR }} /> verpasst
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ROUTINE_NOT_SCHEDULED_COLOR }} /> kein Tag
      </span>
    </div>
  )
}

export default function RoutineHeatmapSection({ months, routines, days, onDayClick }: Props) {
  const monthList = recentMonths(months)
  const todayKey = toDateKey(new Date())

  return (
    <div className="space-y-6">
      {routines.map((routine) => {
        function cellFor(dateKey: string) {
          const weekday = parseDateKey(dateKey).getDay()
          if (!routine.weekdays.includes(weekday)) return { color: ROUTINE_NOT_SCHEDULED_COLOR }
          if (dateKey > todayKey) return { color: ROUTINE_FUTURE_COLOR }
          const done = days[dateKey]?.completions[routine.id] ?? false
          return { color: done ? ROUTINE_DONE_COLOR : ROUTINE_MISSED_COLOR }
        }

        return (
          <section key={routine.id}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-200">{routine.name}</h2>
              <RoutineLegend />
            </div>
            <div className="flex flex-wrap gap-4">
              {monthList.map(({ year, month }) => (
                <MonthGridBox
                  key={`${routine.id}-${year}-${month}`}
                  year={year}
                  month={month}
                  cellFor={cellFor}
                  onDayClick={onDayClick}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
