import * as React from 'react'
import cn from 'classnames'
import ToggleUi from '~ui/Toggle/Toggle'
import type { LabelSide } from '~ui/Toggle/Toggle.style'
import AppBox from '~ui/Primitives/AppBox'

export type Props = {
  input: {
    onChange: (arg0: React.SyntheticEvent<HTMLInputElement>) => void
    value: boolean
    name?: string
  }
  meta?: {
    touched: boolean
    error: string | null | undefined
  }
  label?: string
  roledescription?: string
  helpText?: string
  disabled?: boolean
  id: string
  bold?: boolean
  labelSide?: LabelSide
  className?: string
  toggleClassName?: string
}
export const Toggle = ({
  id,
  input,
  label,
  disabled,
  labelSide,
  meta,
  className,
  toggleClassName,
  bold,
  helpText,
  roledescription,
}: Props) => (
  <AppBox className={cn('form-group', className)}>
    <ToggleUi
      id={id}
      name={input.name}
      className={toggleClassName}
      label={label}
      helpText={helpText}
      labelSide={labelSide}
      disabled={disabled}
      onChange={input.onChange}
      checked={!!input.value}
      bold={bold}
      roledescription={roledescription}
    />
    {meta?.touched && meta?.error}
  </AppBox>
)
export default Toggle
