import type Anthropic from '@anthropic-ai/sdk'
import { describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'

// Scripted replies the fake Claude client returns, one per API call.
function toolCall(input: object) {
  return {
    stop_reason: 'tool_use',
    content: [{ type: 'tool_use', id: 'toolu_1', name: 'searchCruises', input }],
  }
}

function finalAnswer(reply: string, cruiseIds: string[]) {
  return {
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: JSON.stringify({ reply, cruiseIds }) }],
  }
}

function setup(...responses: object[]) {
  const create = vi.fn()
  for (const response of responses) create.mockResolvedValueOnce(response)
  const anthropic = { beta: { messages: { create } } } as unknown as Anthropic
  return { app: buildApp({ anthropic }), create }
}

function ask(app: ReturnType<typeof buildApp>, content: string) {
  return app.inject({
    method: 'POST',
    url: '/assistant',
    payload: { messages: [{ role: 'user', content }] },
  })
}

describe('POST /assistant', () => {
  it('runs searchCruises with the filters the model asked for and sends the results back', async () => {
    const { app, create } = setup(
      toolCall({ destination: 'Alaska' }),
      finalAnswer('The Seattle sailing is the cheaper one.', ['alaska-7-seattle']),
    )

    const res = await ask(app, 'Any Alaska cruises?')

    expect(create).toHaveBeenCalledTimes(2)
    const secondRequest = create.mock.calls[1][0]
    const toolResult = secondRequest.messages.at(-1).content[0]
    expect(toolResult).toMatchObject({ type: 'tool_result', tool_use_id: 'toolu_1' })
    expect(JSON.parse(toolResult.content).map((c: { id: string }) => c.id)).toEqual([
      'alaska-7-seattle',
      'alaska-7-vancouver',
    ])

    expect(res.statusCode).toBe(200)
    expect(res.json().reply).toBe('The Seattle sailing is the cheaper one.')
    expect(res.json().cruises.map((c: { id: string }) => c.id)).toEqual(['alaska-7-seattle'])
  })

  it('ignores cruise ids that do not exist', async () => {
    const { app } = setup(finalAnswer('Try these!', ['made-up-cruise', 'hawaii-7-honolulu']))

    const res = await ask(app, 'Somewhere tropical')

    expect(res.json().cruises.map((c: { id: string }) => c.id)).toEqual(['hawaii-7-honolulu'])
  })

  it('answers politely when the model refuses', async () => {
    const { app } = setup({ stop_reason: 'refusal', content: [] })

    const res = await ask(app, 'something off topic')

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ reply: expect.stringMatching(/sorry/i), cruises: [] })
  })

  it('gives up if the model keeps calling tools', async () => {
    const { app, create } = setup(...Array(10).fill(toolCall({})))

    const res = await ask(app, 'Show me everything')

    expect(create).toHaveBeenCalledTimes(5)
    expect(res.statusCode).toBe(502)
  })

  it('returns 502 when the API call fails', async () => {
    const { app, create } = setup()
    create.mockRejectedValueOnce(new Error('overloaded'))

    const res = await ask(app, 'Hello')

    expect(res.statusCode).toBe(502)
  })

  it('rejects an empty conversation without calling the model', async () => {
    const { app, create } = setup()

    const res = await app.inject({ method: 'POST', url: '/assistant', payload: { messages: [] } })

    expect(res.statusCode).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})
