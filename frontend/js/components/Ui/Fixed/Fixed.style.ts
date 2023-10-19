import styled from 'styled-components'
import { LIGHT_BOX_SHADOW } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export type Position = {
  top?: string
  left: string
  right?: string
  bottom?: string
}
export const Container = styled.div<{
  position: Position
  width: string
  zIndex?: number
}>`
  position: fixed;
  top: ${props => props.position.top || '70px'}; /* space nav bar */
  left: ${props => props.position.left};
  bottom: ${props => props.position.bottom || 'initial'};
  right: ${props => props.position.right || 'initial'};
  z-index: ${props => props.zIndex || 10};
  width: ${props => props.width};
  background-color: #fff;
  border: 1px solid ${colors.borderColor};
  padding: 15px;
  ${LIGHT_BOX_SHADOW};
`
