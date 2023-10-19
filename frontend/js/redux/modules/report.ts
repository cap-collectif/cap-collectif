import type { Exact, Action, Dispatch } from '~/types'
import { UPDATE_ALERT } from '~/constants/AlertConstants'
import FluxDispatcher from '../../dispatchers/AppDispatcher'
import ReportMutation from '~/mutations/ReportMutation'
import { getType } from '~/components/Report/ReportForm'
export type State = {
  readonly currentReportingModal: (number | null | undefined) | (string | null | undefined)
  readonly isLoading: boolean
  readonly elements: Array<(number | null | undefined) | (string | null | undefined)>
}
export type ReportData = {
  status: number
  body: string
}
const initialState: State = {
  currentReportingModal: null,
  isLoading: false,
  elements: [],
}
type OpenModalAction = {
  type: 'report/OPEN_MODAL'
  id: number
}
type CloseModalAction = {
  type: 'report/CLOSE_MODAL'
}
type StartReportingAction = {
  type: 'report/START_LOADING'
}
type StopReportingAction = {
  type: 'report/STOP_LOADING'
}
type AddReportedAction = {
  type: 'report/ADD_REPORTED'
}
export type ReportAction =
  | OpenModalAction
  | CloseModalAction
  | StartReportingAction
  | StopReportingAction
  | AddReportedAction
export const openModal = (id: number): OpenModalAction => ({
  type: 'report/OPEN_MODAL',
  id,
})
export const closeModal = (): CloseModalAction => ({
  type: 'report/CLOSE_MODAL',
})

const startLoading = (): StartReportingAction => ({
  type: 'report/START_LOADING',
})

const stopLoading = (): StopReportingAction => ({
  type: 'report/STOP_LOADING',
})

const addReported = (): AddReportedAction => ({
  type: 'report/ADD_REPORTED',
})

export const submitReport = async (
  reportableId: string,
  report: ReportData,
  dispatch: Dispatch,
  successMessage: string,
) => {
  dispatch(startLoading())
  await ReportMutation.commit({
    input: {
      reportableId,
      type: getType(report.status.toString()),
      body: report.body,
    },
  })
  dispatch(addReported())
  dispatch(stopLoading())
  dispatch(closeModal())
  FluxDispatcher.dispatch({
    actionType: UPDATE_ALERT,
    alert: {
      bsStyle: 'success',
      content: successMessage,
    },
  })
}
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case 'report/START_LOADING':
      return { ...state, isLoading: true }

    case 'report/STOP_LOADING':
      return { ...state, isLoading: false }

    case 'report/OPEN_MODAL':
      return { ...state, currentReportingModal: action.id }

    case 'report/CLOSE_MODAL':
      return { ...state, currentReportingModal: null }

    case 'report/ADD_REPORTED': {
      return { ...state, elements: [...state.elements, state.currentReportingModal] }
    }

    default:
      return state
  }
}
