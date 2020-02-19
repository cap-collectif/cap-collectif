// @flow
import * as React from 'react';
import * as S from './styles';
import Row from '~ui/List/PickableList/row';
import { usePickableList } from '~ui/List/PickableList';

type Props = {
  children: React.ChildrenArray<React.Element<typeof Row>>,
};

const PickableListBody = ({ children }: Props) => {
  const { dispatch } = usePickableList();
  React.useEffect(() => {
    const rowIds = React.Children.toArray(children)
      .filter(c => 'rowId' in c.props)
      .map(c => String(c.props.rowId));
    dispatch({ type: 'INITIALIZE_ROWS', payload: rowIds });
  }, [children, dispatch]);
  return <S.Container>{children}</S.Container>;
};

PickableListBody.displayName = 'PickableList.Body';

export default PickableListBody;
