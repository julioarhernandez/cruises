import { useState } from 'react'
import type { CruiseFilters } from '@cruises/shared'
import CruiseList from './components/CruiseList'
import SearchForm from './components/SearchForm'

export default function App() {
  const [filters, setFilters] = useState<CruiseFilters>({})

  return (
    <main className="container">
      <h1>Cruises</h1>
      <SearchForm filters={filters} onChange={setFilters} />
      <CruiseList filters={filters} />
    </main>
  )
}
