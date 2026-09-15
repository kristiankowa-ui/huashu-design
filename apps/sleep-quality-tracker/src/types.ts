export interface SleepNight {
  /** Datum des Aufwachens, Format YYYY-MM-DD */
  date: string
  totalMinutes: number
  lightMinutes: number | null
  deepMinutes: number | null
  remMinutes: number | null
  awakeMinutes: number | null
  /** Heuristischer Wert 0-100, da Google Fit keinen offiziellen Score liefert */
  qualityScore: number
  source: 'google-fit' | 'manual'
}

export interface RoutineItem {
  id: string
  name: string
  /** 0 = Sonntag ... 6 = Samstag */
  weekdays: number[]
}

export interface DayEntry {
  date: string
  notes: string
  /** routineId -> erledigt */
  completions: Record<string, boolean>
}

export interface AppState {
  routines: RoutineItem[]
  days: Record<string, DayEntry>
  sleepNights: Record<string, SleepNight>
  lastSyncedAt: string | null
}
