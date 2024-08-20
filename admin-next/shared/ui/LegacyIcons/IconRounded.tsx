import * as React from 'react'
import styled from 'styled-components'
import Icon from '@shared/ui/LegacyIcons/Icon'

export const Container = styled.div.attrs({
  className: 'icon-rounded',
})<{
  size: number
  color?: string
  borderColor?: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  border-radius: ${props => `${props.size / 2}px`};
  background-color: ${props => props.color || 'transparent'};
  border: ${props => (props.borderColor ? `1px solid ${props.borderColor}` : 'none')};
`
type Props = {
  children: React.ReactElement<typeof Icon>
  size: number
  color?: string
  borderColor?: string
}

const IconRounded = ({ children, size, color, borderColor }: Props) => (
  <Container size={size} color={color} borderColor={borderColor}>
    {children}
  </Container>
)

export default IconRounded
