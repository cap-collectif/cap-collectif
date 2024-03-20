import type { Filters } from '../Dashboard.context'
import type { FetchPolicy } from 'relay-runtime'

export type QueryOptions = {
  fetchKey?: number
  fetchPolicy?: FetchPolicy | undefined
}

export type QueryOptionsSections = {
  [sectionName: string]: QueryOptions
}

export const getVariablesQuery = (filters: Filters) => ({
  filter: {
    startAt: filters.dateRange.startAt,
    endAt: filters.dateRange.endAt,
    projectId: filters.projectId === 'ALL' ? null : filters.projectId,
  },
})
