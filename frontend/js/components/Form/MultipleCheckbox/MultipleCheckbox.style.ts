import styled from 'styled-components'
import { sharedStyleWrapperItemCheckboxRadio } from '~ui/Form/Input/commonCheckboxRadio'

export const ItemMultipleCheckboxContainer = styled.div.attrs({
  className: 'item-multiple-checkbox-container',
})<{
  hasImage: boolean
}>`
  ${props => sharedStyleWrapperItemCheckboxRadio(props.hasImage)}
`
