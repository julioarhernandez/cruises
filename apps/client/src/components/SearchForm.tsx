import { useEffect, useState } from 'react'
import type { CruiseFilters } from '@cruises/shared'
import { fetchDestinations } from '../api'

const priceOptions = [500, 1000, 1500, 2000]

type Props = {
  filters: CruiseFilters
  onChange: (filters: CruiseFilters) => void
}

export default function SearchForm({ filters, onChange }: Props) {
  const [destinations, setDestinations] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()
    // If this fails the dropdown just shows "Any", which is fine.
    fetchDestinations(controller.signal).then(setDestinations, () => {})
    return () => controller.abort()
  }, [])

  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label>
        Search
        <input
          type="search"
          placeholder="Port, ship, cruise line…"
          value={filters.q ?? ''}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
        />
      </label>

      <label>
        Destination
        <select
          value={filters.destination ?? ''}
          onChange={(e) => onChange({ ...filters, destination: e.target.value || undefined })}
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
          onChange={(e) =>
            onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
          }
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
