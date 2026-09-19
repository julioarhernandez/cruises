import Fastify from 'fastify'
import { cruises } from './cruises.js'

export function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.get('/cruises', async () => {
    return cruises
  })

  app.get<{ Params: { id: string } }>('/cruises/:id', async (request, reply) => {
    const cruise = cruises.find((c) => c.id === request.params.id)
    if (!cruise) {
      return reply.code(404).send({ message: 'Cruise not found' })
    }
    return cruise
  })

  return app
}
