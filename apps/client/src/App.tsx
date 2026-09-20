import { Link, Route, Routes } from 'react-router'
import CruiseDetails from './pages/CruiseDetails'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <main className="container">
      <h1>
        <Link to="/">Cruises</Link>
      </h1>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/cruises/:id" element={<CruiseDetails />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Routes>
    </main>
  )
}
