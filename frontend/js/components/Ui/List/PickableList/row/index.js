// @flow
import * as React from 'react';
import * as S from './styles';
import { usePickableList } from '~ui/List/PickableList';

type Props = {
  children: React.Node,
  rowId?: string | number,
  isSelectable?: boolean,
};

const PickableListRow = ({ children, rowId, isSelectable = true, ...rest }: Props) => {
  const { dispatch, isRowChecked } = usePickableList();
  return (
    <S.Container>
      {isSelectable && (
        <input
          type="checkbox"
          checked={isRowChecked(String(rowId))}
          onChange={e => {
            if (e.target.checked) {
              dispatch({ type: 'SELECT_ROW', payload: String(rowId) });
            } else {
              dispatch({ type: 'DESELECT_ROW', payload: String(rowId) });
            }
          }}
        />
      )}
      <S.ChildWrapper {...rest}>{children}</S.ChildWrapper>
    </S.Container>
  );
};

PickableListRow.displayName = 'PickableList.Row';

export default PickableListRow;
