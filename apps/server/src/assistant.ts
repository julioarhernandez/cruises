import Anthropic from '@anthropic-ai/sdk'
import type { AssistantReply, ChatMessage } from '@cruises/shared'
import { cruises } from './cruises.js'

const MODEL = 'claude-opus-5-5'

const catalog = cruises
  .map(
    (c) =>
      `- ${c.id}: ${c.name}, ${c.destination}, from ${c.departurePort} on ${c.departureDate}, ` +
      `${c.nights} nights, $${c.price}. Ports: ${c.ports.join(', ')}`,
  )
  .join('\n')

const SYSTEM_PROMPT = `You are the assistant on a small cruise search website.
Help people find a cruise that fits what they ask for: destination, budget, dates or trip length.
Keep answers short and friendly. If you don't know something, say so instead of guessing.

These are all the cruises we sell:
${catalog}

Only recommend cruises from this list. Put the ids of the cruises you recommend in cruiseIds,
best match first, and leave it empty if nothing fits.`

// Structured output: the API guarantees the reply is JSON matching this schema.
const replySchema = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'The message shown to the user.' },
    cruiseIds: { type: 'array', items: { type: 'string' } },
  },
  required: ['reply', 'cruiseIds'],
  additionalProperties: false,
}

export async function askAssistant(client: Anthropic, messages: ChatMessage[]): Promise<AssistantReply> {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: replySchema },
    },
    // If the model declines for a safety reason, let the API retry the
    // request on a fallback model instead of failing outright.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages,
  })

  if (response.stop_reason === 'refusal') {
    return { reply: "Sorry, I can't help with that one.", cruises: [] }
  }

  const text = response.content.find((block) => block.type === 'text')?.text ?? ''
  const output: { reply: string; cruiseIds: string[] } = JSON.parse(text)

  // The schema guarantees the shape, not that the ids exist, so only keep real cruises.
  return {
    reply: output.reply,
    cruises: output.cruiseIds.flatMap((id) => cruises.find((c) => c.id === id) ?? []),
  }
}
