import * as React from 'react'

import styled from 'styled-components'
import tinycolor from 'tinycolor2'

type Props = {
  backgroundColor: string
  children: JSX.Element | JSX.Element[] | string
  className: string
  darkness?: number
  id?: string
}
const BoxContainer = styled.div<Props>`
  padding: 15px;
  background-color: ${props =>
    props.darkness && props.darkness > 0
      ? tinycolor(props.backgroundColor).darken(props.darkness).toString()
      : props.backgroundColor};
  border-radius: 4px;
`
export const ColorBox = (props: Props) => {
  const { backgroundColor, children, className, darkness, ...rest } = props
  return (
    <BoxContainer darkness={darkness} className={className} backgroundColor={backgroundColor} {...rest}>
      {children}
    </BoxContainer>
  )
}
ColorBox.defaultProps = {
  darkness: 0,
}
export default ColorBox
