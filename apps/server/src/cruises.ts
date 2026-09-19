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
