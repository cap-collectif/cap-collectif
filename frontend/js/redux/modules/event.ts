import type { Exact, Action } from '../../types'
export type State = {
  readonly eventSelected: string | null | undefined
  readonly isMobileListView: boolean
  readonly showEventCreateModal: boolean
}
const initialState: State = {
  eventSelected: null,
  isMobileListView: true,
  showEventCreateModal: false,
}
type ChangeEventSelectedAction = {
  type: 'event/CHANGE_EVENT_SELECTED'
  eventSelected: string | null | undefined
}
type ChangeEventMobileListView = {
  type: 'event/CHANGE_EVENT_MOBILE_VIEW'
  isMobileListView: boolean
}
export type EventAction =
  | ChangeEventSelectedAction
  | ChangeEventMobileListView
  | {
      type: 'event/CHANGE_FILTER'
      filter: string
      value: string
    }
export const changeEventSelected = (eventSelected: string | null | undefined): ChangeEventSelectedAction => ({
  type: 'event/CHANGE_EVENT_SELECTED',
  eventSelected,
})
export const changeEventMobileListView = (isMobileListView: boolean): ChangeEventMobileListView => ({
  type: 'event/CHANGE_EVENT_MOBILE_VIEW',
  isMobileListView,
})
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state }

    case 'event/CHANGE_EVENT_SELECTED':
      return { ...state, eventSelected: action.eventSelected }

    case 'event/CHANGE_EVENT_MOBILE_VIEW':
      return { ...state, isMobileListView: action.isMobileListView }

    default:
      return state
  }
}
