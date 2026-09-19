import { useEffect, useState } from 'react'
import type { Cruise } from '@cruises/shared'
import { fetchCruises } from '../api'
import CruiseCard from './CruiseCard'

export default function CruiseList() {
  const [cruises, setCruises] = useState<Cruise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchCruises(controller.signal)
      .then(setCruises)
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  if (loading) return <p>Loading cruises…</p>
  if (error) return <p role="alert">Could not load cruises. {error}</p>
  if (cruises.length === 0) return <p>No cruises found.</p>

  return (
    <ul className="cruise-list">
      {cruises.map((cruise) => (
        <li key={cruise.id}>
          <CruiseCard cruise={cruise} />
        </li>
      ))}
    </ul>
  )
}
