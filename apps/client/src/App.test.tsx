import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Cruise } from '@cruises/shared'
import App from './App'
import ThemeProvider from './context/ThemeProvider'

const alaska: Cruise = {
  id: 'alaska-7-seattle',
  name: 'Alaska Inside Passage',
  cruiseLine: 'Princess',
  ship: 'Discovery Princess',
  destination: 'Alaska',
  departurePort: 'Seattle',
  departureDate: '2027-06-06',
  nights: 7,
  price: 1199,
  ports: ['Seattle', 'Juneau', 'Skagway'],
  description: 'Glaciers and whales.',
  image: 'https://example.com/alaska.jpg',
}

const bahamas: Cruise = {
  ...alaska,
  id: 'bahamas-4-ftl',
  name: 'Bahamas Weekend',
  destination: 'Bahamas',
  nights: 4,
  price: 389,
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

// A tiny fake API: answers based on the URL, like the real server would.
function mockApi(overrides: { cruises?: () => Response | Promise<Response> } = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), 'http://localhost')

    if (url.pathname === '/api/destinations') return jsonResponse(['Alaska', 'Bahamas'])
    if (url.pathname === '/api/cruises') {
      if (overrides.cruises) return overrides.cruises()
      const destination = url.searchParams.get('destination')
      return jsonResponse([alaska, bahamas].filter((c) => !destination || c.destination === destination))
    }
    if (url.pathname === `/api/cruises/${alaska.id}`) return jsonResponse(alaska)
    return jsonResponse({ message: 'Cruise not found' }, 404)
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderApp(path = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('search page', () => {
  it('shows a loading message, then the cruises', async () => {
    // Hold the response so the loading state stays on screen until we check it.
    let respond = () => {}
    mockApi({
      cruises: () => new Promise((resolve) => (respond = () => resolve(jsonResponse([alaska, bahamas])))),
    })
    renderApp()

    // The page itself is lazy-loaded, so wait for it to appear.
    expect(await screen.findByText(/loading cruises/i)).toBeInTheDocument()
    respond()
    expect(await screen.findByText('Alaska Inside Passage')).toBeInTheDocument()
    expect(screen.getByText('Bahamas Weekend')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockApi({ cruises: () => jsonResponse({}, 500) })
    renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load cruises/i)
  })

  it('shows an empty state when nothing matches', async () => {
    mockApi({ cruises: () => jsonResponse([]) })
    renderApp()

    expect(await screen.findByText(/no cruises match/i)).toBeInTheDocument()
  })

  it('filters by destination', async () => {
    const user = userEvent.setup()
    const fetchMock = mockApi()
    renderApp()
    await screen.findByText('Bahamas Weekend')

    await user.selectOptions(screen.getByLabelText(/destination/i), 'Alaska')

    // Old results stay on screen while loading, so wait for the Bahamas card to go.
    await waitFor(() => expect(screen.queryByText('Bahamas Weekend')).not.toBeInTheDocument())
    expect(screen.getByText('Alaska Inside Passage')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/cruises?destination=Alaska', expect.anything())
  })

  it('waits for the user to stop typing before searching', async () => {
    const user = userEvent.setup()
    const fetchMock = mockApi()
    renderApp()
    await screen.findByText('Bahamas Weekend')
    fetchMock.mockClear()

    await user.type(screen.getByLabelText(/search/i), 'juneau')

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/cruises?q=juneau', expect.anything())
    })
    const searches = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/cruises'))
    expect(searches).toHaveLength(1)
  })

  it('shows 10 cruises per page and goes back to page 1 when a filter changes', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('scrollTo', vi.fn())
    const many = Array.from({ length: 12 }, (_, i) => ({ ...alaska, id: `cruise-${i + 1}`, name: `Cruise ${i + 1}` }))
    mockApi({ cruises: () => jsonResponse(many) })
    renderApp()

    expect(await screen.findByText('Cruise 1')).toBeInTheDocument()
    expect(screen.queryByText('Cruise 11')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Cruise 11')).toBeInTheDocument()
    expect(screen.queryByText('Cruise 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/destination/i), 'Alaska')

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('reads filters from the URL', async () => {
    mockApi()
    renderApp('/?destination=Bahamas')

    expect(await screen.findByText('Bahamas Weekend')).toBeInTheDocument()
    expect(screen.queryByText('Alaska Inside Passage')).not.toBeInTheDocument()
  })
})

describe('cruise details', () => {
  it('opens a cruise from the list', async () => {
    const user = userEvent.setup()
    mockApi()
    renderApp()

    await user.click(await screen.findByRole('link', { name: 'Alaska Inside Passage' }))

    expect(await screen.findByText('Glaciers and whales.')).toBeInTheDocument()
    expect(screen.getByText('Juneau')).toBeInTheDocument()
  })

  it('shows an error for an unknown cruise', async () => {
    mockApi()
    renderApp('/cruises/nope')

    expect(await screen.findByRole('alert')).toHaveTextContent(/not found/i)
  })
})

describe('theme', () => {
  it('switches to dark mode and remembers it', async () => {
    const user = userEvent.setup()
    mockApi()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })
})
