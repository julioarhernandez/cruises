import Fastify from 'fastify'

export function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  return app
}
