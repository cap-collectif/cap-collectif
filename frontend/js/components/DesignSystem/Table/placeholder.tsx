// @ts-nocheck
import { $Diff } from 'utility-types'
import * as React from 'react'
import type { TableProps } from './index'
import Table from './index'

export type TablePlaceholderProps = $Diff<
  TableProps,
  {
    children: any
  }
> & {
  rowsCount: number
  columnsCount: number
}

const TablePlaceholder = ({ rowsCount, columnsCount, ...props }: TablePlaceholderProps) => {
  const rows = Array(rowsCount).fill(null)
  const columns = Array(columnsCount).fill(null)
  return (
    <Table isLoading {...props}>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column, i) => (
            <Table.Th key={i}>{column}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {rows.map((row, i) => (
          <Table.Tr key={i}>
            {columns.map((column, j) => (
              <Table.Td key={j}>{column}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default TablePlaceholder
