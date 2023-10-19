import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled, { css } from 'styled-components'
import colors from '~/utils/colors'

type Style = {
  color: string
  fontSize: number
  uppercase?: boolean
}

const commonStyle = (color, fontSize, uppercase) => css`
  color: ${colors.white};
  border-radius: 20px;
  padding: 3px 6px;
  background-color: ${color};
  font-size: ${`${fontSize}px`};
  text-transform: ${uppercase ? 'uppercase' : 'initial'};
`

const Container: StyledComponent<Style, {}, HTMLSpanElement> = styled.span`
  ${({ color, fontSize, uppercase }) => commonStyle(color, fontSize, uppercase)};
`
const ClickableContainer: StyledComponent<Style, {}, HTMLButtonElement> = styled.button`
  ${({ color, fontSize, uppercase }) => commonStyle(color, fontSize, uppercase)};
  border: none;
`
type Props = {
  children: JSX.Element | JSX.Element[] | string
  color: string
  fontSize: number
  className?: string
  onClick?: () => void
  uppercase?: boolean
}
export const Label = ({ children, color, fontSize, className, onClick, uppercase }: Props) =>
  onClick ? (
    <ClickableContainer color={color} fontSize={fontSize} className={className} onClick={onClick} uppercase={uppercase}>
      {children}
    </ClickableContainer>
  ) : (
    <Container color={color} fontSize={fontSize} className={className} uppercase={uppercase}>
      {children}
    </Container>
  )
export default Label
