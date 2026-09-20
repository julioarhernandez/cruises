import { useEffect, useRef, useState } from 'react'
import type { CruiseFilters } from '@cruises/shared'
import { fetchDestinations } from '../api'

const priceOptions = [500, 1000, 1500, 2000]
const SEARCH_DELAY_MS = 300

type Props = {
  filters: CruiseFilters
  onChange: (changes: Partial<CruiseFilters>) => void
}

export default function SearchForm({ filters, onChange }: Props) {
  const [destinations, setDestinations] = useState<string[]>([])
  const [text, setText] = useState(filters.q ?? '')
  const [lastQ, setLastQ] = useState(filters.q)
  const searchTimer = useRef<number | undefined>(undefined)

  // Keep the input in sync when the URL changes from outside the form,
  // e.g. the back button or clicking the "Cruises" heading.
  if (filters.q !== lastQ) {
    setLastQ(filters.q)
    setText(filters.q ?? '')
  }

  useEffect(() => {
    const controller = new AbortController()
    // If this fails the dropdown just shows "Any", which is fine.
    fetchDestinations(controller.signal).then(setDestinations, () => {})
    return () => controller.abort()
  }, [])

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  function handleTextChange(value: string) {
    setText(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => onChange({ q: value }), SEARCH_DELAY_MS)
  }

  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label>
        Search
        <input
          type="search"
          placeholder="Port, ship, cruise line…"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </label>

      <label>
        Destination
        <select
          value={filters.destination ?? ''}
          onChange={(e) => onChange({ destination: e.target.value })}
        >
          <option value="">Any</option>
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label>
        Max price
        <select
          value={filters.maxPrice ?? ''}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Any</option>
          {priceOptions.map((p) => (
            <option key={p} value={p}>
              ${p.toLocaleString()}
            </option>
          ))}
        </select>
      </label>
    </form>
  )
}
