import type { Cruise, CruiseFilters } from '@cruises/shared'

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json()
}

export function fetchCruises(filters: CruiseFilters, signal?: AbortSignal) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return getJson<Cruise[]>(query ? `/api/cruises?${query}` : '/api/cruises', signal)
}

export function fetchDestinations(signal?: AbortSignal) {
  return getJson<string[]>('/api/destinations', signal)
}
