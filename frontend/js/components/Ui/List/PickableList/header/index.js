// @flow
import * as React from 'react';
import * as S from './styles';
import { usePickableList } from '~ui/List/PickableList';

type Props = {
  className?: string,
  children: React.Node | (({ selectedRows: string[], rowsCount: number }) => React.Node),
};

const PickableListHeader = ({ children, className }: Props) => {
  const {
    dispatch,
    hasIndeterminateState,
    hasAllRowsChecked,
    selectedRows,
    rowsCount,
  } = usePickableList();
  const checkbox = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (checkbox.current) {
      checkbox.current.indeterminate = hasIndeterminateState;
      checkbox.current.checked = hasAllRowsChecked;
    }
  }, [hasIndeterminateState, hasAllRowsChecked]);
  return (
    <S.Container className={className}>
      <input
        type="checkbox"
        id="allRows"
        className="all-rows-checkbox"
        ref={checkbox}
        onChange={e => {
          if (e.target.checked) {
            dispatch({ type: 'SELECT_ALL_ROWS' });
          } else {
            dispatch({ type: 'DESELECT_ALL_ROWS' });
          }
        }}
      />
      {typeof children === 'function' ? children({ selectedRows, rowsCount }) : children}
    </S.Container>
  );
};

PickableListHeader.displayName = 'PickableList.Header';

export default PickableListHeader;
