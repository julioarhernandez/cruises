import type { Cruise } from '@cruises/shared'
import { formatDate, formatPrice } from '../format'

export default function CruiseCard({ cruise }: { cruise: Cruise }) {
  return (
    <article className="card">
      <div>
        <h2>{cruise.name}</h2>
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
