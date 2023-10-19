import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'

const ContextContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
  }
`
export default ContextContainer
