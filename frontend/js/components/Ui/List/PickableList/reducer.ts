export type State = {
  rows: Record<string, boolean>
}
export type Action =
  | {
      type: 'INITIALIZE_ROWS'
      payload: {
        rowIds: string[]
        selectedRows: string[]
      }
    }
  | {
      type: 'SELECT_ROW'
      payload: string
    }
  | {
      type: 'DESELECT_ROW'
      payload: string
    }
  | {
      type: 'SELECT_ALL_ROWS'
    }
  | {
      type: 'DESELECT_ALL_ROWS'
    }
export const createReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'INITIALIZE_ROWS':
      return {
        ...state,
        rows: action.payload.rowIds.reduce((rowState, rowId) => {
          rowState[rowId] = action.payload.selectedRows.includes(rowId)
          return rowState
        }, {}),
      }

    case 'SELECT_ROW':
      return { ...state, rows: { ...state.rows, [action.payload]: true } }

    case 'DESELECT_ROW':
      return { ...state, rows: { ...state.rows, [action.payload]: false } }

    case 'SELECT_ALL_ROWS':
      return {
        ...state,
        rows: Object.keys(state.rows).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {}),
      }

    case 'DESELECT_ALL_ROWS':
      return {
        ...state,
        rows: Object.keys(state.rows).reduce((acc, key) => {
          acc[key] = false
          return acc
        }, {}),
      }

    default:
      throw new Error(`Unknown action : ${action.type}`)
  }
}
