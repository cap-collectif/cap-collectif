import * as React from 'react'
import { ToggleButtonGroup } from 'react-bootstrap'
import styled from 'styled-components'
import cn from 'classnames'

type Props = {
  type: 'radio' | 'checkbox'
  disabled: boolean
  onChange: (...args: Array<any>) => any
  value: any
  name: string
  children: any
  className?: string
}
export const Container = styled(ToggleButtonGroup)<{
  disabled: boolean
}>`
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
`

const ButtonGroup = ({ type, disabled = false, onChange, value, name, children, className }: Props) => (
  <Container
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={cn(className, {
      disabled,
    })}
  >
    {children}
  </Container>
)

export default ButtonGroup
