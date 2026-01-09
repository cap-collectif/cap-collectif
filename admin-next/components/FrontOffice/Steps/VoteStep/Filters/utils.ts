import { DEFAULT_FILTERS, FilterState } from './useVoteStepFilters'

/**
 * Convert URL filters to local state
 */
export const urlFiltersToLocalState = (urlFilters: {
  sort: string
  category: string | null
  theme: string | null
  status: string | null
  userType: string
  district: string | null
  contributor: string | null
  term: string | null
  latlng: string | null
  latlngBounds: string | null
}): FilterState => ({
  sort: urlFilters.sort,
  category: urlFilters.category,
  theme: urlFilters.theme,
  status: urlFilters.status,
  userType: urlFilters.userType,
  district: urlFilters.district,
  contributor: urlFilters.contributor,
  term: urlFilters.term,
  latlng: urlFilters.latlng,
  latlngBounds: urlFilters.latlngBounds,
})

/**
 * Convert filters to URL params, removing default values
 */
export const filtersToUrlParams = (filters: FilterState) => {
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key as keyof FilterState]
      return [key, value !== defaultValue ? value : null]
    }),
  )
}

/**
 * Count active filters (excluding sort, term, latlng, latlngBounds)
 */
export const getActiveFiltersCount = (urlFilters: {
  category: string | null
  theme: string | null
  status: string | null
  userType: string
  district: string | null
  contributor: string | null
}): number => {
  let count = 0
  const filtersToCount: (keyof FilterState)[] = ['category', 'theme', 'status', 'userType', 'district', 'contributor']

  filtersToCount.forEach(key => {
    const currentValue = urlFilters[key]
    const defaultValue = DEFAULT_FILTERS[key]
    if (currentValue && currentValue !== defaultValue) {
      count++
    }
  })

  return count
}

/**
 * Get accordion IDs that should be open by default based on active filters
 * Always includes 'filter_by', plus any accordion with an active filter
 */
export const getDefaultAccordions = (urlFilters: {
  category: string | null
  theme: string | null
  status: string | null
  userType: string
}): string[] => {
  const accordions: string[] = ['filter_by'] // filter_by must always be open by default

  // Map filter keys to their corresponding accordion IDs
  const filterToAccordionMap: Record<string, string> = {
    category: 'categories',
    theme: 'themes',
    status: 'statuses',
    userType: 'contributors',
  }

  // Check each filter and open its accordion if it's currently amongst active filters
  Object.entries(filterToAccordionMap).forEach(([filterKey, accordionId]) => {
    const currentValue = urlFilters[filterKey as keyof typeof urlFilters]
    const defaultValue = DEFAULT_FILTERS[filterKey as keyof FilterState]
    if (currentValue && currentValue !== defaultValue) {
      accordions.push(accordionId)
    }
  })

  return accordions
}
