import { lazy, Suspense } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router'
import ThemeToggle from './components/ThemeToggle'

// Each page is its own chunk, downloaded the first time someone visits it.
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CruiseDetails = lazy(() => import('./pages/CruiseDetails'))
const AssistantPage = lazy(() => import('./pages/AssistantPage'))

export default function App() {
  return (
    <main className="container">
      <header className="header">
        <h1>
          <Link to="/">Cruises</Link>
        </h1>
        <nav>
          <NavLink to="/" end>
            Search
          </NavLink>
          <NavLink to="/assistant">Ask the assistant</NavLink>
          <ThemeToggle />
        </nav>
      </header>
      <Suspense fallback={<p>Loading…</p>}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/cruises/:id" element={<CruiseDetails />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </Suspense>
    </main>
  )
}
