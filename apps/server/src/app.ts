import Anthropic from '@anthropic-ai/sdk'
import Fastify from 'fastify'
import type { CruiseFilters } from '@cruises/shared'
import { askAssistant, type ChatMessage } from './assistant.js'
import { cruises, destinations, searchCruises } from './cruises.js'

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

const assistantBodySchema = {
  type: 'object',
  required: ['messages'],
  properties: {
    messages: {
      type: 'array',
      minItems: 1,
      maxItems: 50,
      items: {
        type: 'object',
        required: ['role', 'content'],
        properties: {
          role: { enum: ['user', 'assistant'] },
          content: { type: 'string', minLength: 1, maxLength: 2000 },
        },
      },
    },
  },
} as const

type BuildOptions = {
  logger?: boolean
  anthropic?: Anthropic
}

export function buildApp({ logger = false, anthropic = new Anthropic() }: BuildOptions = {}) {
  const app = Fastify({ logger })

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

  app.get('/destinations', async () => {
    return destinations
  })

  app.post<{ Body: { messages: ChatMessage[] } }>(
    '/assistant',
    { schema: { body: assistantBodySchema } },
    async (request, reply) => {
      try {
        const answer = await askAssistant(anthropic, request.body.messages)
        return { reply: answer }
      } catch (err) {
        request.log.error(err, 'assistant request failed')
        return reply.code(502).send({ message: 'The assistant is not available right now.' })
      }
    },
  )

  return app
}
