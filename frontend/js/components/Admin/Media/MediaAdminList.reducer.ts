import { $PropertyType } from 'utility-types'
import type { MediaAdminListStatus } from './MediaAdminList.context'
export type Filters = {
  readonly term: string | null | undefined
}
export type MediaAdminListState = {
  readonly status: MediaAdminListStatus
  readonly filters: Filters
}
export type MediaAdminListParameters = {
  readonly filters: $PropertyType<MediaAdminListState, 'filters'>
}
export type Action =
  | {
      type: 'START_LOADING'
    }
  | {
      type: 'STOP_LOADING'
    }
  | {
      type: 'SEARCH_TERM'
      payload: string | null | undefined
    }
  | {
      type: 'CLEAR_TERM'
    }
export const createReducer = (state: MediaAdminListState, action: Action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, status: 'loading' }

    case 'STOP_LOADING':
      return { ...state, status: 'ready' }

    case 'SEARCH_TERM':
      return { ...state, filters: { ...state.filters, term: action.payload } }

    case 'CLEAR_TERM':
      return { ...state, filters: { ...state.filters, term: null } }

    default:
      throw new Error(`Unknown action : ${action.type}`)
  }
}
