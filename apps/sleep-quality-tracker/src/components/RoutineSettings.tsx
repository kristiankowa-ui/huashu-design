import { useState } from 'react'
import type { RoutineItem } from '../types'
import { WEEKDAY_LABELS } from '../lib/date'

interface Props {
  routines: RoutineItem[]
  onChange: (routines: RoutineItem[]) => void
}

function createId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${base || 'routine'}-${Date.now().toString(36)}`
}

export default function RoutineSettings({ routines, onChange }: Props) {
  const [newName, setNewName] = useState('')

  function toggleWeekday(routineId: string, weekday: number) {
    onChange(
      routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              weekdays: r.weekdays.includes(weekday)
                ? r.weekdays.filter((w) => w !== weekday)
                : [...r.weekdays, weekday].sort(),
            }
          : r,
      ),
    )
  }

  function renameRoutine(routineId: string, name: string) {
    onChange(routines.map((r) => (r.id === routineId ? { ...r, name } : r)))
  }

  function removeRoutine(routineId: string) {
    onChange(routines.filter((r) => r.id !== routineId))
  }

  function addRoutine() {
    const name = newName.trim()
    if (!name) return
    onChange([...routines, { id: createId(name), name, weekdays: [1, 2, 3, 4, 5] }])
    setNewName('')
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200">Routinen &amp; Trainingstage</h2>
      <div className="space-y-3">
        {routines.map((routine) => (
          <div key={routine.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 p-2">
            <input
              value={routine.name}
              onChange={(e) => renameRoutine(routine.id, e.target.value)}
              className="w-40 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex gap-1">
              {WEEKDAY_LABELS.map((label, weekday) => {
                const active = routine.weekdays.includes(weekday)
                return (
                  <button
                    key={weekday}
                    onClick={() => toggleWeekday(routine.id, weekday)}
                    className={`h-7 w-9 rounded-md text-xs font-medium transition ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => removeRoutine(routine.id)}
              className="ml-auto text-xs text-rose-400 hover:text-rose-300"
            >
              Entfernen
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRoutine()}
          placeholder="Neue Routine, z.B. Krafttraining"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={addRoutine}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  )
}
