import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export const CommentBottom: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;

  button {
    margin-right: 10px;
  }
`
