import * as React from 'react';
import { Table } from '@cap-collectif/ui';
import type { TableProps } from '@cap-collectif/ui';

export interface TablePlaceholderProps extends Omit<TableProps, 'emptyMessage'> {
    rowsCount: number;
    columnsCount: number;
}

const TablePlaceholder: React.FC<TablePlaceholderProps> = ({
    rowsCount,
    columnsCount,
    ...props
}) => {
    const rows = Array(rowsCount).fill(null);
    const columns = Array(columnsCount).fill(null);

    return (
        <Table isLoading {...props} emptyMessage="">
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
    );
};

export default TablePlaceholder;
