import { Link, useLocation } from 'react-router'
import type { Cruise } from '@cruises/shared'
import { formatDate, formatPrice } from '../lib/format'

export default function CruiseCard({ cruise }: { cruise: Cruise }) {
  const location = useLocation()

  return (
    <article className="card">
      <div>
        <h2>
          <Link to={`/cruises/${cruise.id}`} state={{ search: location.search }}>
            {cruise.name}
          </Link>
        </h2>
        <p className="muted">
          {cruise.cruiseLine} · {cruise.ship}
        </p>
        <p>
          {cruise.nights} nights from {cruise.departurePort} · {formatDate(cruise.departureDate)}
        </p>
      </div>
      <p className="price">
        from <strong>{formatPrice(cruise.price)}</strong>
      </p>
    </article>
  )
}
