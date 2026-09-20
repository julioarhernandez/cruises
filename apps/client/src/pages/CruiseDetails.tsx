import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import type { Cruise } from '@cruises/shared'
import { fetchCruise } from '../api'
import { formatDate, formatPrice } from '../format'

type Result = {
  id: string
  cruise?: Cruise
  error?: string
}

export default function CruiseDetails() {
  const { id = '' } = useParams()
  const location = useLocation()
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchCruise(id, controller.signal)
      .then((cruise) => setResult({ id, cruise }))
      .catch((err) => {
        if (controller.signal.aborted) return
        setResult({ id, error: err.message })
      })

    return () => controller.abort()
  }, [id])

  const backLink = (
    <Link to={`/${location.state?.search ?? ''}`} className="back">
      ← All cruises
    </Link>
  )

  if (result?.id !== id) return <p>Loading cruise…</p>
  if (!result.cruise) {
    return (
      <>
        {backLink}
        <p role="alert">Could not load this cruise. {result.error}</p>
      </>
    )
  }

  const { cruise } = result

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
