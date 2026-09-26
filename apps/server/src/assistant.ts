import Anthropic from '@anthropic-ai/sdk'
import type { AssistantReply, ChatMessage, CruiseFilters } from '@cruises/shared'
import { cruises, destinations, searchCruises } from './cruises.js'

type MessageParam = Anthropic.Beta.BetaMessageParam
type ToolUseBlock = Anthropic.Beta.BetaToolUseBlock
type ToolResultBlockParam = Anthropic.Beta.BetaToolResultBlockParam

const MODEL = 'claude-opus-5-5'

// Safety net so a confused model can't keep us looping (and spending) forever.
const MAX_TOOL_ROUNDS = 5

function systemPrompt() {
  return `You are the assistant on a small cruise search website.
Help people find a cruise that fits what they ask for: destination, budget, dates or trip length.
Today is ${new Date().toISOString().slice(0, 10)}.

Use the searchCruises tool to look up cruises. Never invent cruises, prices or dates;
only talk about cruises the tool returned. If a search finds nothing, try loosening the filters
once before telling the user nothing matches.

Keep answers short and friendly. Put the ids of the cruises you recommend in cruiseIds,
best match first, and leave it empty if nothing fits.`
}

const searchTool: Anthropic.Beta.BetaTool = {
  name: 'searchCruises',
  description:
    'Search the cruises we sell. Every filter is optional; call it with no filters to list everything. ' +
    'Returns matching cruises as JSON, sorted by departure date.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: 'Free text matched against the cruise name, cruise line, ship and port names, e.g. "Santorini".',
      },
      destination: { type: 'string', enum: destinations },
      maxPrice: { type: 'number', description: 'Maximum price per person in USD.' },
      minNights: { type: 'integer' },
      maxNights: { type: 'integer' },
      month: { type: 'string', description: 'Departure month in YYYY-MM format, e.g. "2026-12".' },
    },
    additionalProperties: false,
  },
}

// Structured output: the API guarantees the final answer is JSON matching this schema.
const replySchema = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'The message shown to the user.' },
    cruiseIds: { type: 'array', items: { type: 'string' } },
  },
  required: ['reply', 'cruiseIds'],
  additionalProperties: false,
}

function runTool(block: ToolUseBlock): ToolResultBlockParam {
  if (block.name !== searchTool.name) {
    return { type: 'tool_result', tool_use_id: block.id, content: `Unknown tool: ${block.name}`, is_error: true }
  }
  // strict: true means the input already matches the schema above.
  const results = searchCruises(block.input as CruiseFilters)
  return { type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(results) }
}

export async function askAssistant(client: Anthropic, messages: ChatMessage[]): Promise<AssistantReply> {
  const conversation: MessageParam[] = [...messages]

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
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
      system: systemPrompt(),
      tools: [searchTool],
      messages: conversation,
    })

    if (response.stop_reason === 'refusal') {
      return { reply: "Sorry, I can't help with that one.", cruises: [] }
    }

    if (response.stop_reason !== 'tool_use') {
      const text = response.content.find((block) => block.type === 'text')?.text ?? ''
      const output: { reply: string; cruiseIds: string[] } = JSON.parse(text)

      // The schema guarantees the shape, not that the ids exist, so only keep real cruises.
      return {
        reply: output.reply,
        cruises: output.cruiseIds.flatMap((id) => cruises.find((c) => c.id === id) ?? []),
      }
    }

    // The model asked for one or more tool calls. Keep its turn as-is, run the
    // tools, and send all the results back in a single user message.
    const toolUses = response.content.filter((block) => block.type === 'tool_use')
    conversation.push({ role: 'assistant', content: response.content })
    conversation.push({ role: 'user', content: toolUses.map(runTool) })
  }

  throw new Error(`Assistant did not finish after ${MAX_TOOL_ROUNDS} tool rounds`)
}
