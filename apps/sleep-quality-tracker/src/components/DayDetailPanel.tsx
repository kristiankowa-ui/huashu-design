import type { DayEntry, RoutineItem, SleepNight } from '../types'
import { formatDisplayDate, formatMinutes, parseDateKey } from '../lib/date'

interface Props {
  date: string
  routines: RoutineItem[]
  entry: DayEntry | undefined
  night: SleepNight | undefined
  onClose: () => void
  onToggleCompletion: (date: string, routineId: string) => void
  onNotesChange: (date: string, notes: string) => void
}

export default function DayDetailPanel({
  date,
  routines,
  entry,
  night,
  onClose,
  onToggleCompletion,
  onNotesChange,
}: Props) {
  const weekday = parseDateKey(date).getDay()
  const scheduledRoutines = routines.filter((r) => r.weekdays.includes(weekday))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">{formatDisplayDate(date)}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Schließen">
            ✕
          </button>
        </div>

        {night ? (
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
            <div>Dauer: {formatMinutes(night.totalMinutes)}</div>
            <div>Qualität: {night.qualityScore}</div>
            <div>Tiefschlaf: {formatMinutes(night.deepMinutes)}</div>
            <div>REM: {formatMinutes(night.remMinutes)}</div>
            <div>Leichter Schlaf: {formatMinutes(night.lightMinutes)}</div>
          </div>
        ) : (
          <p className="mb-4 text-xs text-slate-500">Keine Google-Fit-Schlafdaten für diesen Tag.</p>
        )}

        {scheduledRoutines.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {scheduledRoutines.map((routine) => (
              <label key={routine.id} className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={entry?.completions[routine.id] ?? false}
                  onChange={() => onToggleCompletion(date, routine.id)}
                  className="h-4 w-4 accent-indigo-500"
                />
                {routine.name}
              </label>
            ))}
          </div>
        )}

        <textarea
          value={entry?.notes ?? ''}
          onChange={(e) => onNotesChange(date, e.target.value)}
          placeholder="Notiz für diesen Tag…"
          rows={3}
          className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
