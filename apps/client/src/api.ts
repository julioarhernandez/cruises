import type { Cruise } from '@cruises/shared'

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json()
}

export function fetchCruises(signal?: AbortSignal) {
  return getJson<Cruise[]>('/api/cruises', signal)
}
