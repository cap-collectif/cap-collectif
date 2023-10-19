import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Label from '../Label/Label'
import type { CommonPropsInput } from './common'
import './common'
import { mediaQueryMobile } from '~/utils/sizes'
import { BASE_INPUT } from '~/utils/styles/variables'
export type Props = CommonPropsInput & {
  readonly type: 'text' | 'number' | 'email'
}
const InputContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'input-container',
})`
  input {
    ${BASE_INPUT};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    input {
      width: 100%;
    }
  }
`

const Input = ({
  type,
  label,
  className,
  id,
  name,
  placeholder,
  value = '',
  maxlength,
  minlength,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled = false,
  readonly = false,
}: Props) => (
  <InputContainer className={className}>
    {label && <Label htmlFor={id}>{label}</Label>}
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      maxLength={maxlength}
      minLength={minlength}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      value={value}
      aria-required={required}
      aria-labelledby={id ? `label-${id}` : ''}
      autoComplete="off"
    />
  </InputContainer>
)

export default Input
