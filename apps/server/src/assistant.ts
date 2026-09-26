import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '@cruises/shared'

const MODEL = 'claude-opus-5-5'

const SYSTEM_PROMPT = `You are the assistant on a small cruise search website.
Help people find a cruise that fits what they ask for: destination, budget, dates or trip length.
Keep answers short and friendly. If you don't know something, say so instead of guessing.`

export async function askAssistant(client: Anthropic, messages: ChatMessage[]) {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'low' },
    // If the model declines for a safety reason, let the API retry the
    // request on a fallback model instead of failing outright.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages,
  })

  if (response.stop_reason === 'refusal') {
    return "Sorry, I can't help with that one."
  }

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}
