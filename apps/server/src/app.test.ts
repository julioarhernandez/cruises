import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'
import { cruises as allCruises, type Cruise } from './cruises.js'

const app = buildApp()

async function getCruises(query: Record<string, string>) {
  const res = await app.inject({ method: 'GET', url: '/cruises', query })
  return { status: res.statusCode, cruises: res.json<Cruise[]>() }
}

describe('GET /cruises', () => {
  it('returns all cruises sorted by departure date', async () => {
    const { status, cruises } = await getCruises({})

    expect(status).toBe(200)
    expect(cruises).toHaveLength(allCruises.length)
    const dates = cruises.map((c) => c.departureDate)
    expect(dates).toEqual([...dates].sort())
  })

  it('filters by destination, ignoring case', async () => {
    const { cruises } = await getCruises({ destination: 'alaska' })

    expect(cruises.map((c) => c.id)).toEqual(['alaska-7-seattle', 'alaska-7-vancouver'])
  })

  it('combines filters', async () => {
    const { cruises } = await getCruises({ destination: 'Caribbean', maxPrice: '1000', minNights: '7' })

    expect(cruises.map((c) => c.id)).toEqual(['carib-7-miami'])
  })

  it('searches text across name and ports', async () => {
    const { cruises } = await getCruises({ q: 'santorini' })

    expect(cruises.map((c) => c.id)).toEqual(['greek-7-athens'])
  })

  it('filters by departure month', async () => {
    const { cruises } = await getCruises({ month: '2027-06' })

    expect(cruises.every((c) => c.departureDate.startsWith('2027-06'))).toBe(true)
    expect(cruises).toHaveLength(2)
  })

  it('returns an empty list when nothing matches', async () => {
    const { status, cruises } = await getCruises({ maxPrice: '10' })

    expect(status).toBe(200)
    expect(cruises).toEqual([])
  })

  it('rejects invalid query params', async () => {
    const res = await app.inject({ method: 'GET', url: '/cruises?maxPrice=cheap' })

    expect(res.statusCode).toBe(400)
  })
})

describe('GET /cruises/:id', () => {
  it('returns a single cruise', async () => {
    const res = await app.inject({ method: 'GET', url: '/cruises/hawaii-7-honolulu' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ id: 'hawaii-7-honolulu', destination: 'Hawaii' })
  })

  it('returns 404 for an unknown id', async () => {
    const res = await app.inject({ method: 'GET', url: '/cruises/does-not-exist' })

    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({ message: 'Cruise not found' })
  })
})
