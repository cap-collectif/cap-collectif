import styled from 'styled-components'
import { sharedStyleWrapperItemCheckboxRadio } from '~ui/Form/Input/commonCheckboxRadio'

export const ItemMultipleRadioContainer = styled.div.attrs({
  className: 'item-multiple-radio-container',
})<{
  hasImage: boolean
}>`
  ${props => sharedStyleWrapperItemCheckboxRadio(props.hasImage)}
`
