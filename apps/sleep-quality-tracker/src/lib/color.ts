/** 0 -> rot, 100 -> grün */
export function scoreToColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score))
  const hue = (clamped / 100) * 120
  return `hsl(${hue}, 62%, 38%)`
}

/** Wie nah die Schlafdauer an einem Zielwert (Standard 8h) liegt, als Score 0-100 */
export function durationScore(totalMinutes: number, targetMinutes = 480): number {
  const deviation = Math.abs(totalMinutes - targetMinutes)
  return Math.max(0, 100 - deviation / 4)
}

export const ROUTINE_DONE_COLOR = 'hsl(142, 55%, 32%)'
export const ROUTINE_MISSED_COLOR = 'hsl(0, 60%, 40%)'
export const ROUTINE_NOT_SCHEDULED_COLOR = 'rgba(148, 163, 184, 0.08)'
export const ROUTINE_FUTURE_COLOR = 'rgba(148, 163, 184, 0.18)'
export const EMPTY_COLOR = 'rgba(148, 163, 184, 0.12)'
