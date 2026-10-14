import { buildApp } from './app.js'

const app = buildApp({ logger: true })
const port = Number(process.env.PORT ?? 3000)

try {
  // Render routes traffic from outside the container, so listen on every interface.
  await app.listen({ port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
