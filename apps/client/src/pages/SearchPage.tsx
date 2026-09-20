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

  // Merges into the current params so a delayed search update can't
  // overwrite a dropdown that changed in the meantime.
  function updateFilters(changes: Partial<CruiseFilters>) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '') params.delete(key)
          else params.set(key, String(value))
        }
        return params
      },
      { replace: true },
    )
  }

  return (
    <>
      <SearchForm filters={filters} onChange={updateFilters} />
      <CruiseList filters={filters} />
    </>
  )
}
