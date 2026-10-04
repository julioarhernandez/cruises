import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { Link, useLocation } from 'react-router'
import type { Cruise } from '@cruises/shared'
import { formatDate, formatPrice } from '../lib/format'

// The card only switches between "rest" and "active"; each child decides how
// to react. Motion passes the variant name down to children automatically.
const imageVariants: Variants = {
  rest: { scale: 1 },
  active: { scale: 1.06 },
}

const bodyVariants: Variants = {
  rest: { x: 0, boxShadow: '0 4px 16px rgb(0 0 0 / 0.12)' },
  active: { x: -12, boxShadow: '0 14px 32px rgb(0 0 0 / 0.22)' },
}

const transition = { type: 'spring', stiffness: 300, damping: 24 } as const

export default function CruiseCard({ cruise }: { cruise: Cruise }) {
  const location = useLocation()
  // Hover and keyboard focus both "activate" the card. React's onFocus bubbles
  // up from the link inside, so tabbing to it gets the same effect as the mouse.
  const [active, setActive] = useState(false)

  return (
    <motion.article
      className="card"
      initial={false}
      animate={active ? 'active' : 'rest'}
      transition={transition}
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <figure className="card-figure">
        <motion.img
          className="card-image"
          src={cruise.image}
          alt=""
          width={640}
          height={360}
          loading="lazy"
          variants={imageVariants}
          transition={transition}
        />
      </figure>
      <motion.div className="card-body" variants={bodyVariants} transition={transition}>
        <h2>
          <Link to={`/cruises/${cruise.id}`} state={{ search: location.search }}>
            {cruise.name}
          </Link>
        </h2>
        <p className="muted">
          {cruise.cruiseLine} · {cruise.ship}
        </p>
        <p className="card-trip">
          {cruise.nights} nights from {cruise.departurePort} · {formatDate(cruise.departureDate)}
        </p>
        <p className="price">
          from <strong>{formatPrice(cruise.price)}</strong>
        </p>
      </motion.div>
    </motion.article>
  )
}
