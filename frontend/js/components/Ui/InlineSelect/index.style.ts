import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  & li {
    margin-right: 10px;
  }
`
