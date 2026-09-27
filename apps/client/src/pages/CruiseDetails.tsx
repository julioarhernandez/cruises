import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import type { Cruise } from '@cruises/shared'
import { fetchCruise } from '../api'
import { formatDate, formatPrice } from '../format'

export default function CruiseDetails() {
  const { id = '' } = useParams()
  const location = useLocation()
  const [cruise, setCruise] = useState<Cruise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        setCruise(await fetchCruise(id, controller.signal))
      } catch (err) {
        if (!controller.signal.aborted) setError((err as Error).message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [id])

  const backLink = (
    <Link to={`/${location.state?.search ?? ''}`} className="back">
      ← All cruises
    </Link>
  )

  if (loading) return <p>Loading cruise…</p>
  if (error || !cruise) {
    return (
      <>
        {backLink}
        <p role="alert">Could not load this cruise. {error}</p>
      </>
    )
  }

  return (
    <article className="details">
      {backLink}
      <h2>{cruise.name}</h2>
      <p className="muted">
        {cruise.cruiseLine} · {cruise.ship}
      </p>
      <p>{cruise.description}</p>

      <dl>
        <dt>Departs</dt>
        <dd>
          {cruise.departurePort} on {formatDate(cruise.departureDate)}
        </dd>
        <dt>Length</dt>
        <dd>{cruise.nights} nights</dd>
        <dt>Price</dt>
        <dd>from {formatPrice(cruise.price)} per person</dd>
      </dl>

      <h3>Itinerary</h3>
      <ol>
        {cruise.ports.map((port, i) => (
          <li key={i}>{port}</li>
        ))}
      </ol>
    </article>
  )
}
