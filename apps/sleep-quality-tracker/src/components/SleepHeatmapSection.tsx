import type { SleepNight } from '../types'
import MonthGridBox from './MonthGridBox'
import { recentMonths, toDateKey } from '../lib/date'
import { scoreToColor, durationScore, EMPTY_COLOR } from '../lib/color'

interface Props {
  months: number
  sleepNights: Record<string, SleepNight>
  onDayClick: (date: string) => void
}

function ScoreLegend() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
      <span>schlecht</span>
      <span
        className="h-2 w-16 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(0,62%,38%), hsl(60,62%,38%), hsl(120,62%,38%))' }}
      />
      <span>gut</span>
    </div>
  )
}

export default function SleepHeatmapSection({ months, sleepNights, onDayClick }: Props) {
  const monthList = recentMonths(months)
  const todayKey = toDateKey(new Date())

  function durationCell(dateKey: string) {
    const night = sleepNights[dateKey]
    if (!night || dateKey > todayKey) return { color: EMPTY_COLOR }
    return { color: scoreToColor(durationScore(night.totalMinutes)) }
  }

  function qualityCell(dateKey: string) {
    const night = sleepNights[dateKey]
    if (!night || dateKey > todayKey) return { color: EMPTY_COLOR }
    return { color: scoreToColor(night.qualityScore) }
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Schlafdauer (Ziel: 8h)</h2>
          <ScoreLegend />
        </div>
        <div className="flex flex-wrap gap-4">
          {monthList.map(({ year, month }) => (
            <MonthGridBox key={`dur-${year}-${month}`} year={year} month={month} cellFor={durationCell} onDayClick={onDayClick} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Schlafqualität*</h2>
          <ScoreLegend />
        </div>
        <div className="flex flex-wrap gap-4">
          {monthList.map(({ year, month }) => (
            <MonthGridBox key={`qual-${year}-${month}`} year={year} month={month} cellFor={qualityCell} onDayClick={onDayClick} />
          ))}
        </div>
      </section>
    </div>
  )
}
