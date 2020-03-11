// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import * as S from './styles';
import Header from './header';
import Body from './body';
import Row from './row';
import { type Action, createReducer, type State } from '~ui/List/PickableList/reducer';
import type { Context } from '~ui/List/PickableList/context';
import { PickableListContext } from '~ui/List/PickableList/context';

type Props = {
  onScrollToBottom?: () => void,
  useInfiniteScroll?: boolean,
  hasMore?: boolean,
  loader?: React.Node,
  children: React.ChildrenArray<React.Element<typeof Header> | React.Element<typeof Body>>,
};

export const usePickableList = (): Context => {
  const context = React.useContext(PickableListContext);
  if (!context) {
    throw new Error(
      `You can't use the PickableListContext outsides a PickableList.Provider component.`,
    );
  }
  return context;
};

type ProviderProps = {|
  +children: React.Node,
|};

const Provider = ({ children }: ProviderProps) => {
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
    }),
    [state],
  );
  return <PickableListContext.Provider value={context}>{children}</PickableListContext.Provider>;
};

const noop = () => {};

const PickableList = ({
  children,
  useInfiniteScroll = false,
  onScrollToBottom = noop,
  hasMore = true,
  loader,
  ...rest
}: Props) => {
  return (
    <S.Container {...rest}>
      {useInfiniteScroll ? (
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={onScrollToBottom}
          hasMore={hasMore}
          loader={loader}>
          {children}
        </InfiniteScroll>
      ) : (
        children
      )}
    </S.Container>
  );
};

PickableList.Provider = Provider;
PickableList.Header = Header;
PickableList.Body = Body;
PickableList.Row = Row;

export default PickableList;
