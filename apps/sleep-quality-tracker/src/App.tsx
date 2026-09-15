import { useEffect, useMemo, useState } from 'react'
import type { AppState, SleepNight } from './types'
import { loadState, saveState, getOrCreateDayEntry } from './lib/storage'
import { lastNDays } from './lib/date'
import GoogleConnect from './components/GoogleConnect'
import RoutineSettings from './components/RoutineSettings'
import SleepTable from './components/SleepTable'

const RANGE_OPTIONS = [7, 14, 30, 60, 90]

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [rangeDays, setRangeDays] = useState(30)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const dates = useMemo(() => lastNDays(rangeDays), [rangeDays])

  function handleSynced(nights: SleepNight[]) {
    setState((prev) => {
      const sleepNights = { ...prev.sleepNights }
      for (const night of nights) {
        sleepNights[night.date] = night
      }
      return { ...prev, sleepNights, lastSyncedAt: new Date().toISOString() }
    })
  }

  function handleToggleCompletion(date: string, routineId: string) {
    setState((prev) => {
      const entry = getOrCreateDayEntry(prev, date)
      const updatedEntry = {
        ...entry,
        completions: { ...entry.completions, [routineId]: !entry.completions[routineId] },
      }
      return { ...prev, days: { ...prev.days, [date]: updatedEntry } }
    })
  }

  function handleNotesChange(date: string, notes: string) {
    setState((prev) => {
      const entry = getOrCreateDayEntry(prev, date)
      return { ...prev, days: { ...prev.days, [date]: { ...entry, notes } } }
    })
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Schlaf &amp; Routine Tracker</h1>
            <p className="text-sm text-slate-500">
              Schlafdaten aus Google Fit, Tagesnotizen und deine Routine an einem Ort.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Zeitraum</label>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {RANGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} Tage
                </option>
              ))}
            </select>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
            >
              {settingsOpen ? 'Routinen ausblenden' : 'Routinen bearbeiten'}
            </button>
          </div>
        </header>

        <GoogleConnect
          rangeDays={rangeDays}
          lastSyncedAt={state.lastSyncedAt}
          onSynced={handleSynced}
        />

        {settingsOpen && (
          <RoutineSettings
            routines={state.routines}
            onChange={(routines) => setState((prev) => ({ ...prev, routines }))}
          />
        )}

        <SleepTable
          dates={dates}
          routines={state.routines}
          dayEntries={state.days}
          sleepNights={state.sleepNights}
          onToggleCompletion={handleToggleCompletion}
          onNotesChange={handleNotesChange}
        />

        <p className="text-xs text-slate-600">
          * Der Qualitätswert ist eine lokale Schätzung aus Schlafdauer und Tiefschlaf-/REM-Anteil,
          da Google Fit selbst keinen offiziellen Schlafqualitäts-Score liefert. Alle Notizen und
          Routinen werden ausschließlich lokal in diesem Browser gespeichert.
        </p>
      </div>
    </div>
  )
}
