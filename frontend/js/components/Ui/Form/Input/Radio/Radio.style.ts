import styled, { css } from 'styled-components'
import cn from 'classnames'
import { sharedStyleCheckboxRadio } from '../commonCheckboxRadio'

const RadioContainer = styled.div.attrs<any>({
  className: 'radio-container',
})<{
  hasImage: boolean
  checked: boolean
}>`
  ${props => sharedStyleCheckboxRadio(props.hasImage, props.checked)}
`
export const LabelRadioButtonContainer = styled.div.attrs<any>(({ isChecked }) => ({
  className: cn(
    {
      'is-checked': isChecked,
    },
    'label-radio-container',
  ),
}))<{
  isChecked: boolean
  color: string | null | undefined
  colorOnHover: boolean
}>`
  ${({ colorOnHover, color, isChecked }) => css`
    background-color: ${isChecked ? color || '#000' : '#fff'};
    color: ${isChecked ? '#fff' : color || '#000'};
    border: ${color ? `1px solid ${color}` : '1px solid #000'};
    padding: 10px;
    border-radius: 4px;
    ${colorOnHover &&
    css`
      &:hover {
        border: 1px solid ${color ?? '#000'} !important;
        color: ${isChecked ? '#fff' : color || '#000'} !important;
      }
    `}
  `};
`
export default RadioContainer
