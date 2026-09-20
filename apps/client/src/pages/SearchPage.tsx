import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { CruiseFilters } from '@cruises/shared'
import CruiseList from '../components/CruiseList'
import SearchForm from '../components/SearchForm'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // CruiseList refetches when `filters` changes identity, so only build a
  // new object when the URL actually changes.
  const filters = useMemo<CruiseFilters>(() => {
    const maxPrice = searchParams.get('maxPrice')
    return {
      q: searchParams.get('q') ?? undefined,
      destination: searchParams.get('destination') ?? undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }
  }, [searchParams])

  function handleChange(next: CruiseFilters) {
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.destination) params.set('destination', next.destination)
    if (next.maxPrice) params.set('maxPrice', String(next.maxPrice))
    setSearchParams(params, { replace: true })
  }

  return (
    <>
      <SearchForm filters={filters} onChange={handleChange} />
      <CruiseList filters={filters} />
    </>
  )
}
