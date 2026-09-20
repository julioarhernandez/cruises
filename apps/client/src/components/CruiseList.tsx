import { useEffect, useState } from 'react'
import type { Cruise, CruiseFilters } from '@cruises/shared'
import { fetchCruises } from '../api'
import CruiseCard from './CruiseCard'

type Result = {
  filters: CruiseFilters
  cruises: Cruise[]
  error?: string
}

export default function CruiseList({ filters }: { filters: CruiseFilters }) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchCruises(filters, controller.signal)
      .then((cruises) => setResult({ filters, cruises }))
      .catch((err) => {
        if (controller.signal.aborted) return
        setResult({ filters, cruises: [], error: err.message })
      })

    return () => controller.abort()
  }, [filters])

  // The result belongs to an older search until the new request finishes.
  const loading = result?.filters !== filters

  if (loading) return <p>Loading cruises…</p>
  if (result.error) return <p role="alert">Could not load cruises. {result.error}</p>
  if (result.cruises.length === 0) return <p>No cruises match your search.</p>

  return (
    <ul className="cruise-list">
      {result.cruises.map((cruise) => (
        <li key={cruise.id}>
          <CruiseCard cruise={cruise} />
        </li>
      ))}
    </ul>
  )
}
