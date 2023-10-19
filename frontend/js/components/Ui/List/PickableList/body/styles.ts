import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  border: 1px solid ${colors.lightGray};
  ${MAIN_BORDER_RADIUS};
  overflow: hidden;
`
