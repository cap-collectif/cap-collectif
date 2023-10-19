import { $PropertyType } from 'utility-types'
import type { ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql'
import '~relay/DebateArgument_argument.graphql'
export type ArgumentState = 'PUBLISHED' | 'WAITING' | 'TRASHED'
export type VoteState = 'ALL' | 'PUBLISHED' | 'WAITING'
export type FilterArgument = {
  readonly type: ForOrAgainstValue[]
  readonly state: ArgumentState
}
export type FilterVote = {
  readonly state: VoteState
}
export type Filters = {
  readonly argument: FilterArgument
  readonly vote: FilterVote
}
export type ProjectAdminDebateState = {
  readonly filters: Filters
}
export type ProjectAdminDebateParameters = {
  readonly filters: $PropertyType<ProjectAdminDebateState, 'filters'>
}
export type Action =
  | {
      type: 'CHANGE_ARGUMENT_TYPE'
      payload: ForOrAgainstValue[]
    }
  | {
      type: 'CHANGE_ARGUMENT_STATE'
      payload: ArgumentState
    }
  | {
      type: 'CHANGE_VOTE_STATE'
      payload: VoteState
    }
export const createReducer = (state: ProjectAdminDebateState, action: Action) => {
  switch (action.type) {
    case 'CHANGE_ARGUMENT_TYPE':
      return { ...state, filters: { ...state.filters, argument: { ...state.filters.argument, type: action.payload } } }

    case 'CHANGE_ARGUMENT_STATE':
      return { ...state, filters: { ...state.filters, argument: { ...state.filters.argument, state: action.payload } } }

    case 'CHANGE_VOTE_STATE':
      return { ...state, filters: { ...state.filters, vote: { ...state.filters.vote, state: action.payload } } }

    default:
      throw new Error(`Unknown action : ${action.type}`)
  }
}
