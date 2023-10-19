import * as React from 'react'
import Label from '../../Label/Label'
import TextAreaContainer from '~ui/Form/Input/TextArea/TextArea.style'
import type { CommonPropsInput } from '~ui/Form/Input/common'

type Props = CommonPropsInput & {
  rows?: number
  cols?: number
}

const TextArea = ({
  label,
  className,
  id,
  name,
  placeholder,
  rows,
  cols,
  disabled = false,
  readonly = false,
  value = '',
  maxlength,
  minlength,
  onChange,
  onBlur,
}: Props) => (
  <TextAreaContainer className={className}>
    {label && <Label htmlFor={id}>{label}</Label>}
    <textarea
      name={name}
      id={id}
      rows={rows}
      cols={cols}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      readOnly={readonly}
      maxLength={maxlength}
      minLength={minlength}
      onChange={onChange}
      onBlur={onBlur}
    />
  </TextAreaContainer>
)

export default TextArea
