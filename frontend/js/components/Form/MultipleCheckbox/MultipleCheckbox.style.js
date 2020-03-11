// @flow
import styled, { type StyledComponent } from 'styled-components';
import { sharedStyleWrapperItemCheckboxRadio } from '~ui/Form/Input/commonCheckboxRadio';

export const ItemMultipleCheckboxContainer: StyledComponent<
  { hasImage: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'item-multiple-checkbox-container',
})`
  ${props => sharedStyleWrapperItemCheckboxRadio(props.hasImage)}
`;
