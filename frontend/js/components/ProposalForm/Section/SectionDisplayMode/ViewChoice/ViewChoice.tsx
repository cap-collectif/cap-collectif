import * as React from 'react'
import { Container } from './ViewChoice.style'
import type { NativeInput } from '~ui/Form/Input/common'
import type { Tooltip } from '~ui/Toggle/Toggle'
import Toggle from '~ui/Toggle/Toggle'
type Props = {
  input: NativeInput
  label: string
  id: string
  hasError: boolean
  onChange: () => void
  icon: JSX.Element | JSX.Element[] | string
  children?: JSX.Element | JSX.Element[] | string
  isOpen?: boolean
  tooltip: Tooltip | null | undefined
  meta: {
    error: string | null | undefined
  }
}

const ViewChoice = ({ label, input, id, children, isOpen, icon, hasError, tooltip }: Props) => (
  <Container isOpen={isOpen} hasError={hasError}>
    <div className="head">
      {icon}
      <Toggle
        id={id}
        label={label}
        checked={input?.value as any as boolean | null | undefined}
        name={input.name}
        onChange={input.onChange}
        tooltip={tooltip}
      />
    </div>

    {children}
  </Container>
)

export default ViewChoice
