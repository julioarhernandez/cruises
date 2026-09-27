import { Link, NavLink, Route, Routes } from 'react-router'
import ThemeToggle from './components/ThemeToggle'
import AssistantPage from './pages/AssistantPage'
import CruiseDetails from './pages/CruiseDetails'
import SearchPage from './pages/SearchPage'

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
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/cruises/:id" element={<CruiseDetails />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Routes>
    </main>
  )
}
