import type { DayEntry, RoutineItem, SleepNight } from '../types'
import { formatDisplayDate, formatMinutes, parseDateKey } from '../lib/date'

interface Props {
  dates: string[]
  routines: RoutineItem[]
  dayEntries: Record<string, DayEntry>
  sleepNights: Record<string, SleepNight>
  onToggleCompletion: (date: string, routineId: string) => void
  onNotesChange: (date: string, notes: string) => void
}

function qualityBadgeClass(score: number): string {
  if (score >= 75) return 'bg-emerald-500/20 text-emerald-300'
  if (score >= 50) return 'bg-amber-500/20 text-amber-300'
  return 'bg-rose-500/20 text-rose-300'
}

export default function SleepTable({
  dates,
  routines,
  dayEntries,
  sleepNights,
  onToggleCompletion,
  onNotesChange,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-300">Datum</th>
            <th className="px-3 py-2 text-left font-medium text-slate-300">Dauer</th>
            <th className="px-3 py-2 text-left font-medium text-slate-300">Tiefschlaf</th>
            <th className="px-3 py-2 text-left font-medium text-slate-300">REM</th>
            <th className="px-3 py-2 text-left font-medium text-slate-300">Leicht</th>
            <th className="px-3 py-2 text-left font-medium text-slate-300" title="Heuristischer Wert, kein offizieller Google-Fit-Score">
              Qualität*
            </th>
            {routines.map((r) => (
              <th key={r.id} className="px-3 py-2 text-center font-medium text-slate-300">
                {r.name}
              </th>
            ))}
            <th className="px-3 py-2 text-left font-medium text-slate-300 min-w-[220px]">Notizen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {dates.map((date) => {
            const night = sleepNights[date]
            const entry = dayEntries[date]
            const weekday = parseDateKey(date).getDay()
            return (
              <tr key={date} className="hover:bg-slate-900/40">
                <td className="whitespace-nowrap px-3 py-2 text-slate-200">{formatDisplayDate(date)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-300">
                  {night ? formatMinutes(night.totalMinutes) : '–'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                  {night ? formatMinutes(night.deepMinutes) : '–'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                  {night ? formatMinutes(night.remMinutes) : '–'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                  {night ? formatMinutes(night.lightMinutes) : '–'}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {night ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${qualityBadgeClass(night.qualityScore)}`}>
                      {night.qualityScore}
                    </span>
                  ) : (
                    <span className="text-slate-600">–</span>
                  )}
                </td>
                {routines.map((routine) => {
                  const scheduled = routine.weekdays.includes(weekday)
                  const done = entry?.completions[routine.id] ?? false
                  return (
                    <td key={routine.id} className="px-3 py-2 text-center">
                      {scheduled ? (
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => onToggleCompletion(date, routine.id)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      ) : (
                        <span className="text-slate-700">–</span>
                      )}
                    </td>
                  )
                })}
                <td className="px-3 py-2">
                  <textarea
                    value={entry?.notes ?? ''}
                    onChange={(e) => onNotesChange(date, e.target.value)}
                    placeholder="Notiz für diesen Tag…"
                    rows={1}
                    className="w-full min-w-[200px] resize-y rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
