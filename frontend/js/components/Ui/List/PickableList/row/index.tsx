import * as React from 'react'
import * as S from './styles'
import { usePickableList } from '~ui/List/PickableList/usePickableList'

type Props = {
  children: JSX.Element | JSX.Element[] | string
  rowId?: string | number
  isSelectable?: boolean
  className?: string
  onFocus?: () => void
  onBlur?: () => void
  onMouseLeave?: () => void
  onMouseOver?: () => void
}

const PickableListRow = ({
  children,
  rowId,
  isSelectable = true,
  className,
  onFocus,
  onBlur,
  onMouseLeave,
  onMouseOver,
  ...rest
}: Props) => {
  const { dispatch, isRowChecked } = usePickableList()
  return (
    <S.Container
      className={className}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {isSelectable && (
        <input
          type="checkbox"
          checked={isRowChecked(String(rowId))}
          onChange={e => {
            if (e.target.checked) {
              dispatch({
                type: 'SELECT_ROW',
                payload: String(rowId),
              })
            } else {
              dispatch({
                type: 'DESELECT_ROW',
                payload: String(rowId),
              })
            }
          }}
        />
      )}
      <S.ChildWrapper {...rest}>{children}</S.ChildWrapper>
    </S.Container>
  )
}

PickableListRow.displayName = 'PickableList.Row'
export default PickableListRow
