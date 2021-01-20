// @flow
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import * as S from './styles';
import Row from '~ui/List/PickableList/row';
import { usePickableList } from '~ui/List/PickableList/usePickableList';

type Props = {
  children?: null | React.ChildrenArray<React.Element<typeof Row | any>>,
};

const PickableListBody = ({ children }: Props) => {
  const { dispatch, selectedRows, rows } = usePickableList();

  React.useEffect(() => {
    const rowIds = React.Children.toArray(children)
      .filter(c => 'rowId' in c.props)
      .map(c => String(c.props.rowId));

    if (!isEqual(rowIds, Object.keys(rows))) {
      dispatch({ type: 'INITIALIZE_ROWS', payload: { rowIds, selectedRows } });
    }
  }, [children, selectedRows, rows, dispatch]);
  return <S.Container>{children}</S.Container>;
};

PickableListBody.displayName = 'PickableList.Body';

export default PickableListBody;
