import type { ComponentType } from 'react'
import 'react'
import styled, { css } from 'styled-components'

type FormProps = {
  onSubmit: (arg0: Record<string, any>) => void
}
export const Form: ComponentType<FormProps> = styled('div').attrs({
  className: 'form',
})`
  text-align: left;
`
type LabelProps = {
  htmlFor?: string
}
export const Label: ComponentType<LabelProps> = styled('label').attrs({
  className: 'form__label',
})`
  display: flex;
  font-size: 14px;
  font-weight: bold;
  color: #333;
`
type SubLabelProps = {
  htmlFor?: string
}
export const SubLabel: ComponentType<SubLabelProps> = styled('label').attrs({
  className: 'form__subLabel',
})`
  font-size: 14px;
  color: #333 !important;
`
const fullWidthCss = css`
  display: flex;
  width: 100%;
  min-width: 100%;
`
type InputProps = {
  fullWidth?: boolean
}
export const Input: ComponentType<InputProps> = styled('input')`
  width: 65px;
  height: 28px;
  padding: 4px;
  border: 1px solid rgba(204, 204, 204, 1);
  ${({ fullWidth }) => (fullWidth ? fullWidthCss : null)}
  border-radius: 3px;
  color: #333 !important;

  .form__label + & {
    margin-top: 4px;
  }

  & + .form__label {
    margin-top: 8px;
  }

  .form__subLabel + & {
    margin-left: 4px;
  }

  & + .form__subLabel {
    margin-left: 8px;
  }
`
