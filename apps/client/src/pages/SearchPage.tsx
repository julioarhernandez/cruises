import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { CruiseFilters } from '@cruises/shared'
import CruiseList from '../components/CruiseList'
import SearchForm from '../components/SearchForm'
import { useDebouncedValue } from '../useDebouncedValue'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const destination = searchParams.get('destination') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  // The input updates on every keystroke, but we only search once the user
  // stops typing. Dropdowns apply right away.
  const debouncedQ = useDebouncedValue(q, 300)

  // CruiseList refetches whenever this object changes, so only rebuild it
  // when one of the values actually changes.
  const filters = useMemo<CruiseFilters>(
    () => ({
      q: debouncedQ || undefined,
      destination: destination || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    [debouncedQ, destination, maxPrice],
  )

  function updateFilters(name: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(name, value)
    else params.delete(name)
    setSearchParams(params, { replace: true })
  }

  return (
    <>
      <SearchForm q={q} destination={destination} maxPrice={maxPrice} onChange={updateFilters} />
      <CruiseList filters={filters} />
    </>
  )
}
