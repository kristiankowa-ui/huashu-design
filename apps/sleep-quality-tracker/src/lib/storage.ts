import type { AppState, DayEntry, RoutineItem } from '../types'

const STORAGE_KEY = 'sleep-quality-tracker:state:v1'

const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: 'morgenroutine', name: 'Morgenroutine', weekdays: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'mobility', name: 'Mobility Workout', weekdays: [1, 3, 5] },
]

function defaultState(): AppState {
  return {
    routines: DEFAULT_ROUTINES,
    days: {},
    sleepNights: {},
    lastSyncedAt: null,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      routines: parsed.routines?.length ? parsed.routines : DEFAULT_ROUTINES,
      days: parsed.days ?? {},
      sleepNights: parsed.sleepNights ?? {},
      lastSyncedAt: parsed.lastSyncedAt ?? null,
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage kann in seltenen Fällen (privater Modus, voller Speicher) fehlschlagen.
    // Die App bleibt in dem Fall im aktuellen Session-Zustand nutzbar.
  }
}

export function getOrCreateDayEntry(state: AppState, date: string): DayEntry {
  return state.days[date] ?? { date, notes: '', completions: {} }
}
