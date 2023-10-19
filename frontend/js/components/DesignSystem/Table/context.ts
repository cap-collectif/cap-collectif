// @ts-nocheck
import { $PropertyType } from 'utility-types'
import * as React from 'react'
import type { Action } from './reducer'
import type { State } from '~ui/List/PickableList/reducer'

export type Context = {
  selectable: boolean
  isLoading: boolean
  rows: $PropertyType<State, 'rows'>
  rowsCount: number
  hasAnyRowsChecked: boolean
  hasAllRowsChecked: boolean
  hasIndeterminateState: boolean
  selectedRows: string[]
  isRowChecked: (rowId: string) => boolean
  dispatch: (arg0: Action) => void
}
export const TableContext = React.createContext<Context>({
  selectable: false,
  isLoading: false,
  rows: {},
  rowsCount: 0,
  hasAnyRowsChecked: false,
  hasAllRowsChecked: false,
  hasIndeterminateState: false,
  selectedRows: [],
  isRowChecked: () => false,
  dispatch: () => {},
})
export const useTable = (): Context => {
  const context = React.useContext(TableContext)

  if (!context) {
    throw new Error(`You can't use the TableContext outsides a Table.Provider component.`)
  }

  return context
}
