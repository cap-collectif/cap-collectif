import * as React from 'react'
import PickableList from '~ui/List/PickableList/index'
import Skeleton from '~ds/Skeleton'
type Props = {
  readonly headerContent?: JSX.Element | JSX.Element[] | string
  readonly rowsCount?: number
}
export const PickableListPlaceholder = ({ headerContent, rowsCount = 10 }: Props) => {
  const rows = Array(rowsCount).fill(null)
  return (
    <PickableList>
      <PickableList.Header isSelectable={false}>
        <p
          style={{
            margin: 0,
          }}
        >
          {headerContent ?? <span>&nbsp;</span>}
        </p>
      </PickableList.Header>
      <PickableList.Body>
        {rows.map((row, i) => (
          <PickableList.Row isSelectable={false} key={i} rowId={i}>
            <Skeleton.Text size="sm" width="200px" />
          </PickableList.Row>
        ))}
      </PickableList.Body>
    </PickableList>
  )
}
export default PickableListPlaceholder
