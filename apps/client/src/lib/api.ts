import type { AssistantReply, ChatMessage, Cruise, CruiseFilters } from '@cruises/shared'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (res.status === 404) {
    throw new Error('Not found.')
  }
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}.`)
  }
  return res.json()
}

export function fetchCruises(filters: CruiseFilters, signal?: AbortSignal) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return request<Cruise[]>(query ? `/api/cruises?${query}` : '/api/cruises', { signal })
}

export function fetchCruise(id: string, signal?: AbortSignal) {
  return request<Cruise>(`/api/cruises/${encodeURIComponent(id)}`, { signal })
}

export function fetchDestinations(signal?: AbortSignal) {
  return request<string[]>('/api/destinations', { signal })
}

export function askAssistant(messages: ChatMessage[]) {
  return request<AssistantReply>('/api/assistant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}
