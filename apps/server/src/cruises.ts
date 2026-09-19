import data from '../data/cruises.json' with { type: 'json' }

export type Cruise = {
  id: string
  name: string
  cruiseLine: string
  ship: string
  destination: string
  departurePort: string
  departureDate: string
  nights: number
  price: number
  ports: string[]
  description: string
}

export const cruises: Cruise[] = data

export type CruiseFilters = {
  q?: string
  destination?: string
  maxPrice?: number
  minNights?: number
  maxNights?: number
  month?: string
}

export function searchCruises(filters: CruiseFilters): Cruise[] {
  const q = filters.q?.trim().toLowerCase()
  const destination = filters.destination?.toLowerCase()

  return cruises
    .filter((cruise) => {
      if (q) {
        const text = [cruise.name, cruise.destination, cruise.cruiseLine, cruise.ship, ...cruise.ports]
          .join(' ')
          .toLowerCase()
        if (!text.includes(q)) return false
      }
      if (destination && cruise.destination.toLowerCase() !== destination) return false
      if (filters.maxPrice !== undefined && cruise.price > filters.maxPrice) return false
      if (filters.minNights !== undefined && cruise.nights < filters.minNights) return false
      if (filters.maxNights !== undefined && cruise.nights > filters.maxNights) return false
      if (filters.month && !cruise.departureDate.startsWith(filters.month)) return false
      return true
    })
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
}
