import * as React from 'react'
import { Container } from './LabelState.style'

type Props = {
  color: string
  label?: string
}

const LabelState = ({ color, label }: Props) => (
  <Container color={color}>
    <div className="pin" />
    {label && <span>{label}</span>}
  </Container>
)

export default LabelState
