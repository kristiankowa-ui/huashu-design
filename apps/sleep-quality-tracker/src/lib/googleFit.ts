import type { SleepNight } from '../types'
import { toDateKey } from './date'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const SLEEP_SCOPE = 'https://www.googleapis.com/auth/fitness.sleep.read'
const SLEEP_ACTIVITY_TYPE = 72
const MERGED_SLEEP_SEGMENT_SOURCE =
  'derived:com.google.sleep.segment:com.google.android.gms:merged'

// https://developers.google.com/fit/rest/v1/reference/sleep-sessions#sleep-stages
const STAGE_LIGHT = new Set([4])
const STAGE_DEEP = new Set([5])
const STAGE_REM = new Set([6])
const STAGE_AWAKE = new Set([1, 3])

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (resp: { access_token?: string; error?: string }) => void
          }): { requestAccessToken: (opts?: { prompt?: string }) => void }
        }
      }
    }
  }
}

let gisLoadPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisLoadPromise) return gisLoadPromise
  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity Services konnte nicht geladen werden.'))
    document.head.appendChild(script)
  })
  return gisLoadPromise
}

export async function requestGoogleFitAccessToken(clientId: string): Promise<string> {
  await loadGisScript()
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services ist nicht verfügbar.')
  }
  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SLEEP_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || 'Kein Zugriffstoken erhalten.'))
          return
        }
        resolve(resp.access_token)
      },
    })
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

interface FitSession {
  id: string
  startTimeMillis: string
  endTimeMillis: string
  activityType?: number
}

interface FitDataPoint {
  startTimeNanos: string
  endTimeNanos: string
  value: { intVal?: number }[]
}

async function fitFetch(accessToken: string, url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Google-Zugriffstoken abgelaufen. Bitte erneut verbinden.')
    throw new Error(`Google Fit API Fehler (${res.status})`)
  }
  return res.json()
}

async function fetchSleepSessions(
  accessToken: string,
  startTime: Date,
  endTime: Date,
): Promise<FitSession[]> {
  const url = new URL('https://www.googleapis.com/fitness/v1/users/me/sessions')
  url.searchParams.set('startTime', startTime.toISOString())
  url.searchParams.set('endTime', endTime.toISOString())
  const data = await fitFetch(accessToken, url.toString())
  const sessions: FitSession[] = data.session ?? []
  return sessions.filter((s) => s.activityType === SLEEP_ACTIVITY_TYPE)
}

async function fetchSleepSegments(
  accessToken: string,
  startTimeNanos: string,
  endTimeNanos: string,
): Promise<FitDataPoint[]> {
  const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${encodeURIComponent(
    MERGED_SLEEP_SEGMENT_SOURCE,
  )}/datasets/${startTimeNanos}-${endTimeNanos}`
  try {
    const data = await fitFetch(accessToken, url)
    return data.point ?? []
  } catch {
    // Manche Konten/Geräte liefern keine Segment-Daten (nur Sitzungsdauer verfügbar).
    return []
  }
}

function estimateQualityScore(totalMinutes: number, deepMinutes: number | null, remMinutes: number | null): number {
  const durationScore = Math.min(totalMinutes / 480, 1) * 60
  const restorativeRatio =
    deepMinutes !== null && remMinutes !== null && totalMinutes > 0
      ? Math.min((deepMinutes + remMinutes) / totalMinutes, 1)
      : 0.4
  return Math.round(durationScore + restorativeRatio * 40)
}

/**
 * Lädt Schlafdaten der letzten `days` Tage aus Google Fit und aggregiert sie
 * pro Nacht (zugeordnet zum Datum des Aufwachens).
 */
export async function fetchRecentSleepNights(
  accessToken: string,
  days: number,
): Promise<SleepNight[]> {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000)
  const sessions = await fetchSleepSessions(accessToken, startTime, endTime)

  const nights: SleepNight[] = []
  for (const session of sessions) {
    const startMillis = Number(session.startTimeMillis)
    const endMillis = Number(session.endTimeMillis)
    if (!Number.isFinite(startMillis) || !Number.isFinite(endMillis) || endMillis <= startMillis) continue

    const totalMinutes = (endMillis - startMillis) / 60000
    const points = await fetchSleepSegments(
      accessToken,
      `${startMillis * 1_000_000}`,
      `${endMillis * 1_000_000}`,
    )

    let lightMinutes = 0
    let deepMinutes = 0
    let remMinutes = 0
    let awakeMinutes = 0
    let hasStageData = false

    for (const point of points) {
      const stage = point.value?.[0]?.intVal
      if (stage === undefined) continue
      const durationMin =
        (Number(point.endTimeNanos) - Number(point.startTimeNanos)) / 1_000_000 / 60000
      if (STAGE_LIGHT.has(stage)) {
        lightMinutes += durationMin
        hasStageData = true
      } else if (STAGE_DEEP.has(stage)) {
        deepMinutes += durationMin
        hasStageData = true
      } else if (STAGE_REM.has(stage)) {
        remMinutes += durationMin
        hasStageData = true
      } else if (STAGE_AWAKE.has(stage)) {
        awakeMinutes += durationMin
        hasStageData = true
      }
    }

    const date = toDateKey(new Date(endMillis))
    nights.push({
      date,
      totalMinutes: Math.round(totalMinutes),
      lightMinutes: hasStageData ? Math.round(lightMinutes) : null,
      deepMinutes: hasStageData ? Math.round(deepMinutes) : null,
      remMinutes: hasStageData ? Math.round(remMinutes) : null,
      awakeMinutes: hasStageData ? Math.round(awakeMinutes) : null,
      qualityScore: estimateQualityScore(
        totalMinutes,
        hasStageData ? deepMinutes : null,
        hasStageData ? remMinutes : null,
      ),
      source: 'google-fit',
    })
  }

  return nights
}
