export type Action =
  | {
      type: 'RESET'
    }
  | {
      type: 'FETCH_INIT'
    }
  | {
      type: 'FETCH_ERROR'
      payload: Error
    }
  | {
      type: 'FETCH_SUCCESS'
      payload: ReadonlyArray<any>
    }
  | {
      type: 'SET_RESULT'
      payload: ReadonlyArray<any>
    }
export type State = {
  readonly error: Error | null | undefined
  readonly status: 'default' | 'loading' | 'error' | 'no_result'
  readonly results: ReadonlyArray<any>
}
export const createReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'RESET':
      return {
        status: 'default',
        error: null,
        results: [],
      }

    case 'FETCH_INIT':
      return { ...state, status: 'loading' }

    case 'FETCH_ERROR':
      return { ...state, error: action.payload, status: 'error' }

    case 'FETCH_SUCCESS':
    case 'SET_RESULT':
      return { ...state, status: action.payload.length === 0 ? 'no_result' : 'default', results: action.payload }

    default:
      throw new Error(`Unknown action : ${action.type}`)
  }
}
