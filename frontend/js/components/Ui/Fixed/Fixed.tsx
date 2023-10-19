import * as React from 'react'
import type { Position } from './Fixed.style'
import { Container } from './Fixed.style'

type Props = {
  position: Position
  children: JSX.Element | JSX.Element[] | string
  show?: boolean
  width?: string
  className?: string
  zIndex?: number
}

const Fixed = ({ position, children, show = true, width = 'auto', className, zIndex }: Props) =>
  show ? (
    <Container position={position} width={width} className={className} zIndex={zIndex}>
      {children}
    </Container>
  ) : null

export default Fixed
