import { useEffect, useState } from 'react'
import type { Cruise, CruiseFilters } from '@cruises/shared'
import { fetchCruises } from '../api'
import CruiseCard from './CruiseCard'

export default function CruiseList({ filters }: { filters: CruiseFilters }) {
  const [cruises, setCruises] = useState<Cruise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Aborting cancels the request if the filters change before it finishes,
    // so an old, slow response can't overwrite a newer one.
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        setCruises(await fetchCruises(filters, controller.signal))
      } catch (err) {
        if (!controller.signal.aborted) setError((err as Error).message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [filters])

  if (error) return <p role="alert">Could not load cruises. {error}</p>
  if (loading && cruises.length === 0) return <p>Loading cruises…</p>
  if (cruises.length === 0) return <p>No cruises match your search.</p>

  // While a new search is loading, keep the previous results on screen (dimmed)
  // instead of flashing a loading message.
  return (
    <ul className="cruise-list" aria-busy={loading} style={{ opacity: loading ? 0.6 : 1 }}>
      {cruises.map((cruise) => (
        <li key={cruise.id}>
          <CruiseCard cruise={cruise} />
        </li>
      ))}
    </ul>
  )
}
