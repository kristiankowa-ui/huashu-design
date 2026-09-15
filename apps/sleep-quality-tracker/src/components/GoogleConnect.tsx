import { useState } from 'react'
import { requestGoogleFitAccessToken, fetchRecentSleepNights } from '../lib/googleFit'
import type { SleepNight } from '../types'

const CLIENT_ID_STORAGE_KEY = 'sleep-quality-tracker:google-client-id'

interface Props {
  rangeDays: number
  lastSyncedAt: string | null
  onSynced: (nights: SleepNight[]) => void
}

export default function GoogleConnect({ rangeDays, lastSyncedAt, onSynced }: Props) {
  const [clientId, setClientId] = useState(
    () => import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem(CLIENT_ID_STORAGE_KEY) || '',
  )
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'syncing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  function persistClientId(value: string) {
    setClientId(value)
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, value)
  }

  async function handleConnectAndSync() {
    if (!clientId.trim()) {
      setError('Bitte zuerst eine Google OAuth Client-ID eintragen.')
      return
    }
    setError(null)
    try {
      let token = accessToken
      if (!token) {
        setStatus('connecting')
        token = await requestGoogleFitAccessToken(clientId.trim())
        setAccessToken(token)
      }
      setStatus('syncing')
      const nights = await fetchRecentSleepNights(token, rangeDays)
      onSynced(nights)
      setStatus('idle')
    } catch (e) {
      setStatus('error')
      setAccessToken(null)
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler bei der Google Fit Synchronisierung.')
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Google OAuth Client-ID
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => persistClientId(e.target.value)}
            placeholder="deine-client-id.apps.googleusercontent.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleConnectAndSync}
          disabled={status === 'connecting' || status === 'syncing'}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'connecting' && 'Verbinde…'}
          {status === 'syncing' && 'Synchronisiere…'}
          {status === 'idle' && (accessToken ? 'Erneut synchronisieren' : 'Mit Google Fit verbinden & synchronisieren')}
          {status === 'error' && 'Erneut versuchen'}
        </button>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {lastSyncedAt
          ? `Zuletzt synchronisiert: ${new Date(lastSyncedAt).toLocaleString('de-DE')}`
          : 'Noch nicht synchronisiert.'}
      </div>
      {error && <div className="mt-2 text-xs text-rose-400">{error}</div>}
    </div>
  )
}
