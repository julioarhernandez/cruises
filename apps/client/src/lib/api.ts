import type { AssistantReply, ChatMessage, Cruise, CruiseFilters } from '@cruises/shared'

// In development Vite proxies /api to the local server. In production the
// client is on GitHub Pages and the server on Render, so the build sets the URL.
const API_URL = import.meta.env.VITE_API_URL || '/api'

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
  return request<Cruise[]>(`${API_URL}/cruises${query ? `?${query}` : ''}`, { signal })
}

export function fetchCruise(id: string, signal?: AbortSignal) {
  return request<Cruise>(`${API_URL}/cruises/${encodeURIComponent(id)}`, { signal })
}

export function fetchDestinations(signal?: AbortSignal) {
  return request<string[]>(`${API_URL}/destinations`, { signal })
}

export function askAssistant(messages: ChatMessage[]) {
  return request<AssistantReply>(`${API_URL}/assistant`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}

// Fire and forget: a sleeping server starts booting before the first real request.
export function wakeServer() {
  fetch(`${API_URL}/health`).catch(() => {})
}
