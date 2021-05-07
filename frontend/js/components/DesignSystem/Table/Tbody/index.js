// @flow
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import InfiniteScroll from 'react-infinite-scroller';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { useTable } from '~ds/Table/context';
import Tr from '~ds/Table/Tr';
import Spinner from '~ds/Spinner/Spinner';

type TbodyProps = {|
  ...AppBoxProps,
  +children: ?React.ChildrenArray<React.Element<typeof Tr>>,
  +onScrollToBottom?: () => void,
  +useInfiniteScroll?: boolean,
  +hasMore?: boolean,
  +loader?: React.Node,
|};

const TableLoader = () => (
  <AppBox as="tr">
    <AppBox as="td" colSpan="100%" textAlign="center" py={3}>
      <Spinner size="m" />
    </AppBox>
  </AppBox>
);

const TableBody = React.forwardRef<AppBoxProps, HTMLElement>((props: AppBoxProps, ref) => (
  <AppBox as="tbody" bg="white" key="table-tbody" color="gray.900" ref={ref} {...props} />
));

const Tbody = ({
  children,
  useInfiniteScroll = false,
  onScrollToBottom = noop,
  hasMore = false,
  loader = <TableLoader key="table-loader" />,
  ...props
}: TbodyProps): React.Node => {
  const { rows, selectedRows, dispatch } = useTable();

  React.useEffect(() => {
    if (children) {
      const rowIds = React.Children.toArray(children)
        .filter(c => 'rowId' in c.props)
        .map(c => String(c.props.rowId));

      if (!isEqual(rowIds, Object.keys(rows))) {
        dispatch({ type: 'INITIALIZE_ROWS', payload: { rowIds, selectedRows } });
      }
    }
  }, [children, selectedRows, rows, dispatch]);

  return useInfiniteScroll ? (
    <InfiniteScroll
      initialLoad={false}
      loadMore={onScrollToBottom}
      hasMore={hasMore}
      loader={loader}
      element={TableBody}>
      {children}
    </InfiniteScroll>
  ) : (
    <TableBody {...props}>{children}</TableBody>
  );
};

Tbody.displayName = 'Table.Tbody';

export default Tbody;
