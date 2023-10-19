import { $PropertyType } from 'utility-types'
import * as React from 'react'
import type { Action, State } from '~ui/List/PickableList/reducer'

export type Context = {
  rows: $PropertyType<State, 'rows'>
  rowsCount: number
  hasAnyRowsChecked: boolean
  hasAllRowsChecked: boolean
  hasIndeterminateState: boolean
  selectedRows: string[]
  isRowChecked: (rowId: string) => boolean
  dispatch: (arg0: Action) => void
}
export const PickableListContext = React.createContext<Context>({
  rows: {},
  rowsCount: 0,
  hasAnyRowsChecked: false,
  hasAllRowsChecked: false,
  hasIndeterminateState: false,
  selectedRows: [],
  isRowChecked: () => false,
  dispatch: () => {},
})
