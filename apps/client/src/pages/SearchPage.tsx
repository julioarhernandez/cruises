import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { CruiseFilters } from '@cruises/shared'
import CruiseList from '../components/CruiseList'
import SearchForm from '../components/SearchForm'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const destination = searchParams.get('destination') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

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
    // New filters mean new results, so start again from the first page.
    params.delete('page')
    setSearchParams(params, { replace: true })
  }

  function changePage(next: number) {
    const params = new URLSearchParams(searchParams)
    if (next > 1) params.set('page', String(next))
    else params.delete('page')
    // Not `replace`, so the back button goes to the previous page.
    setSearchParams(params)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <SearchForm q={q} destination={destination} maxPrice={maxPrice} onChange={updateFilters} />
      <CruiseList filters={filters} page={page} onPageChange={changePage} />
    </>
  )
}
