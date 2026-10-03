import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Cruise } from '@cruises/shared'
import AssistantPage from './AssistantPage'

const hawaii: Cruise = {
  id: 'hawaii-7-honolulu',
  name: 'Hawaiian Islands',
  cruiseLine: 'Norwegian',
  ship: 'Pride of America',
  destination: 'Hawaii',
  departurePort: 'Honolulu',
  departureDate: '2027-02-06',
  nights: 7,
  price: 1799,
  ports: ['Honolulu', 'Kahului'],
  description: 'Four islands in a week.',
  image: 'https://example.com/hawaii.jpg',
}

function renderPage() {
  render(
    <MemoryRouter>
      <AssistantPage />
    </MemoryRouter>,
  )
}

async function send(text: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Message'), text)
  await user.click(screen.getByRole('button', { name: 'Send' }))
}

describe('assistant page', () => {
  it('sends the conversation and shows the reply with suggested cruises', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ reply: 'Hawaii is lovely in February.', cruises: [hawaii] }),
    )
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    await send('Somewhere warm in February')

    expect(screen.getByText('Somewhere warm in February')).toBeInTheDocument()
    expect(await screen.findByText('Hawaii is lovely in February.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hawaiian Islands' })).toHaveAttribute(
      'href',
      '/cruises/hawaii-7-honolulu',
    )

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/assistant')
    expect(JSON.parse(String(init.body))).toEqual({
      messages: [{ role: 'user', content: 'Somewhere warm in February' }],
    })
  })

  it('shows an error and keeps the question when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 502 })))
    renderPage()

    await send('Any deals?')

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not answer/i)
    expect(screen.getByLabelText('Message')).toHaveValue('Any deals?')
  })
})
