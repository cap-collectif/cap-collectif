// @ts-nocheck
import * as React from 'react'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import Thead from './Thead'
import Tbody from './Tbody'
import Tr from './Tr'
import Td from './Td'
import Th from './Th'
import ActionBar from './ActionBar'
import EmptyMessage from './EmptyMessage'
import { TableContext } from './context'
import Flex from '~ui/Primitives/Layout/Flex'
import { createReducer } from './reducer'
export type TableProps = AppBoxProps & {
  readonly children: JSX.Element | JSX.Element[]
  readonly actionBar?: JSX.Element | JSX.Element[] | string | ((arg0: { selectedRows: string[] }) => React.ReactNode)
  readonly selectable?: boolean
  readonly isLoading?: boolean
  readonly onReset?: () => void
}
type TableProviderProps = {
  readonly selectable?: boolean
  readonly isLoading?: boolean
  readonly children: JSX.Element | JSX.Element[] | string
}

const TableProvider = ({ selectable = false, isLoading = false, children }: TableProviderProps) => {
  const [state, dispatch] = React.useReducer(createReducer, {
    rows: {},
  })
  const context = React.useMemo(
    () => ({
      get hasAnyRowsChecked() {
        return Object.keys(state.rows).some(rowId => state.rows[rowId] === true)
      },

      get hasAllRowsChecked() {
        const keys = Object.keys(state.rows)
        return keys.length > 0 && keys.every(rowId => state.rows[rowId] === true)
      },

      get selectedRows() {
        return Object.keys(state.rows).filter(rowId => state.rows[rowId] === true)
      },

      get hasIndeterminateState() {
        return this.hasAnyRowsChecked && this.selectedRows.length < Object.keys(this.rows).length
      },

      get rowsCount() {
        return Object.keys(this.rows).length
      },

      isRowChecked: rowId => rowId in state.rows && state.rows[rowId] === true,
      rows: state.rows,
      dispatch,
      selectable,
      isLoading,
    }),
    [state.rows, selectable, isLoading],
  )
  return <TableContext.Provider value={context}>{children}</TableContext.Provider>
}

const Table = ({ children, actionBar, selectable, isLoading, onReset, ...props }: TableProps) => (
  <TableProvider selectable={selectable} isLoading={isLoading}>
    <TableContext.Consumer>
      {context =>
        selectable ? (
          <Flex
            direction="column"
            width="100%"
            borderRadius="table"
            overflow="hidden"
            border="normal"
            borderColor="gray.150"
          >
            <ActionBar>{actionBar}</ActionBar>

            <AppBox width="100%">
              <AppBox as="table" width="100%" {...props}>
                {children}
              </AppBox>
              {context.rowsCount === 0 && onReset && <EmptyMessage onReset={onReset} />}
            </AppBox>
          </Flex>
        ) : (
          <AppBox width="100%">
            <AppBox as="table" borderRadius="table" overflow="hidden" width="100%" {...props}>
              {children}
            </AppBox>

            {context.rowsCount === 0 && onReset && <EmptyMessage onReset={onReset} />}
          </AppBox>
        )
      }
    </TableContext.Consumer>
  </TableProvider>
)

Table.Thead = Thead
Table.Tbody = Tbody
Table.Tr = Tr
Table.Th = Th
Table.Td = Td
export default Table
