import { useEffect, useState } from 'react'
import type { AppState, SleepNight } from './types'
import { loadState, saveState, getOrCreateDayEntry } from './lib/storage'
import GoogleConnect from './components/GoogleConnect'
import RoutineSettings from './components/RoutineSettings'
import SleepHeatmapSection from './components/SleepHeatmapSection'
import RoutineHeatmapSection from './components/RoutineHeatmapSection'
import DayDetailPanel from './components/DayDetailPanel'

const MONTH_OPTIONS = [1, 2, 3, 6]

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [monthsToShow, setMonthsToShow] = useState(2)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

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
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Schlaf &amp; Routine Tracker</h1>
            <p className="text-sm text-slate-500">
              Schlafdaten aus Google Fit, Tagesnotizen und deine Routine als Kalenderkacheln.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Anzeigen</label>
            <select
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {MONTH_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} Monat{n > 1 ? 'e' : ''}
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
          rangeDays={Math.max(90, monthsToShow * 31)}
          lastSyncedAt={state.lastSyncedAt}
          onSynced={handleSynced}
        />

        {settingsOpen && (
          <RoutineSettings
            routines={state.routines}
            onChange={(routines) => setState((prev) => ({ ...prev, routines }))}
          />
        )}

        <SleepHeatmapSection months={monthsToShow} sleepNights={state.sleepNights} onDayClick={setSelectedDate} />

        <RoutineHeatmapSection
          months={monthsToShow}
          routines={state.routines}
          days={state.days}
          onDayClick={setSelectedDate}
        />

        {selectedDate && (
          <DayDetailPanel
            date={selectedDate}
            routines={state.routines}
            entry={state.days[selectedDate]}
            night={state.sleepNights[selectedDate]}
            onClose={() => setSelectedDate(null)}
            onToggleCompletion={handleToggleCompletion}
            onNotesChange={handleNotesChange}
          />
        )}

        <p className="text-xs text-slate-600">
          * Der Qualitätswert ist eine lokale Schätzung aus Schlafdauer und Tiefschlaf-/REM-Anteil,
          da Google Fit selbst keinen offiziellen Schlafqualitäts-Score liefert. Klicke auf eine
          Kachel, um Notizen zu schreiben oder Routinen für den Tag abzuhaken. Alle Daten werden
          ausschließlich lokal in diesem Browser gespeichert.
        </p>
      </div>
    </div>
  )
}
