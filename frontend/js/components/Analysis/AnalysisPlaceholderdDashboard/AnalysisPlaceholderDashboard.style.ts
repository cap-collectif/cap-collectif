import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import PickableList from '~ui/List/PickableList'

export const PickableContainer: StyledComponent<any, {}, typeof PickableList> = styled(PickableList)`
  margin: 0 2rem 2rem 2rem;
`
export const PickableHeader: StyledComponent<any, {}, typeof PickableList.Header> = styled(PickableList.Header)`
  justify-content: flex-end;

  & > * {
    margin: 0 30px 0 0;
  }
`
