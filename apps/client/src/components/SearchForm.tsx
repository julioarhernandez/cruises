import { useEffect, useState } from 'react'
import { fetchDestinations } from '../api'

const priceOptions = [500, 1000, 1500, 2000]

type Props = {
  q: string
  destination: string
  maxPrice: string
  onChange: (name: string, value: string) => void
}

export default function SearchForm({ q, destination, maxPrice, onChange }: Props) {
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
          value={q}
          onChange={(e) => onChange('q', e.target.value)}
        />
      </label>

      <label>
        Destination
        <select value={destination} onChange={(e) => onChange('destination', e.target.value)}>
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
        <select value={maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)}>
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
