// @flow
import * as React from 'react';
import * as S from './styles';
import { usePickableList } from '~ui/List/PickableList';

type Props = {
  className?: string,
  label?: string | React.Node,
  children: React.Node | (({ selectedRows: string[], rowsCount: number }) => React.Node),
};

const PickableListHeader = ({ children, className, label }: Props) => {
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
      <div className="wrapper-checkbox-all-rows">
        <input
          type="checkbox"
          id="allRows"
          ref={checkbox}
          onChange={e => {
            if (e.target.checked) {
              dispatch({ type: 'SELECT_ALL_ROWS' });
            } else {
              dispatch({ type: 'DESELECT_ALL_ROWS' });
            }
          }}
        />
        {label && <label htmlFor="allRows">{label}</label>}
      </div>
      {typeof children === 'function' ? children({ selectedRows, rowsCount }) : children}
    </S.Container>
  );
};

PickableListHeader.displayName = 'PickableList.Header';

export default PickableListHeader;
