import Fastify from 'fastify'
import type { CruiseFilters } from '@cruises/shared'
import { cruises, searchCruises } from './cruises.js'

const searchQuerySchema = {
  type: 'object',
  properties: {
    q: { type: 'string' },
    destination: { type: 'string' },
    maxPrice: { type: 'number', minimum: 0 },
    minNights: { type: 'integer', minimum: 1 },
    maxNights: { type: 'integer', minimum: 1 },
    month: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
  },
  additionalProperties: false,
} as const

export function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.get<{ Querystring: CruiseFilters }>(
    '/cruises',
    { schema: { querystring: searchQuerySchema } },
    async (request) => {
      return searchCruises(request.query)
    },
  )

  app.get<{ Params: { id: string } }>('/cruises/:id', async (request, reply) => {
    const cruise = cruises.find((c) => c.id === request.params.id)
    if (!cruise) {
      return reply.code(404).send({ message: 'Cruise not found' })
    }
    return cruise
  })

  return app
}
