// @flow
import styled, { type StyledComponent } from 'styled-components';
import { sharedStyleWrapperItemCheckboxRadio } from '~ui/Form/Input/commonCheckboxRadio';

export const ItemMultipleRadioContainer: StyledComponent<
  { hasImage: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'item-multiple-radio-container',
})`
  ${props => sharedStyleWrapperItemCheckboxRadio(props.hasImage)}
`;
