// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Thead from './Thead';
import Tbody from './Tbody';
import Tr from './Tr';
import Td from './Td';
import Th from './Th';
import ActionBar from './ActionBar';
import { TableContext } from './context';
import Flex from '~ui/Primitives/Layout/Flex';
import { createReducer, type Action, type State } from './reducer';

export type TableProps = {|
  ...AppBoxProps,
  +children: React.ChildrenArray<React.Element<typeof Thead> | React.Element<typeof Tbody>>,
  +actionBar?: React.Node | (({ selectedRows: string[] }) => React.Node),
  +selectable?: boolean,
  +isLoading?: boolean,
|};

type TableProviderProps = {|
  +selectable?: boolean,
  +isLoading?: boolean,
  +children: React.Node,
|};

const TableProvider = ({ selectable = false, isLoading = false, children }: TableProviderProps) => {
  const [state, dispatch] = React.useReducer<State, Action>(createReducer, { rows: {} });

  const context = React.useMemo(
    () => ({
      get hasAnyRowsChecked() {
        return Object.keys(state.rows).some(rowId => state.rows[rowId] === true);
      },
      get hasAllRowsChecked() {
        const keys = Object.keys(state.rows);
        return keys.length > 0 && keys.every(rowId => state.rows[rowId] === true);
      },
      get selectedRows() {
        return Object.keys(state.rows).filter(rowId => state.rows[rowId] === true);
      },
      get hasIndeterminateState() {
        return this.hasAnyRowsChecked && this.selectedRows.length < Object.keys(this.rows).length;
      },
      get rowsCount() {
        return Object.keys(this.rows).length;
      },
      isRowChecked: rowId => rowId in state.rows && state.rows[rowId] === true,
      rows: state.rows,
      dispatch,
      selectable,
      isLoading,
    }),
    [state.rows, selectable, isLoading],
  );

  return <TableContext.Provider value={context}>{children}</TableContext.Provider>;
};

const Table = ({ children, actionBar, selectable, isLoading, ...props }: TableProps) => (
  <TableProvider selectable={selectable} isLoading={isLoading}>
    {selectable ? (
      <Flex
        direction="column"
        width="100%"
        borderRadius="table"
        overflow="hidden"
        border="normal"
        borderColor="gray.150"
      >
        <ActionBar>{actionBar}</ActionBar>

        <AppBox as="table" {...props}>
          {children}
        </AppBox>
      </Flex>
    ) : (
      <AppBox
        as="table"
        borderRadius="table"
        overflow="hidden"
        width="100%"
        border="normal"
        borderColor="gray.150"
        {...props}>
        {children}
      </AppBox>
    )}
  </TableProvider>
);

Table.Thead = Thead;
Table.Tbody = Tbody;
Table.Tr = Tr;
Table.Th = Th;
Table.Td = Td;

export default Table;
