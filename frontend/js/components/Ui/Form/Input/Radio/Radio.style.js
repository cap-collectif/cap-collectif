// @flow
import styled, { type StyledComponent } from 'styled-components';
import { sharedStyleCheckboxRadio } from '../commonCheckboxRadio';

const RadioContainer: StyledComponent<
  { hasImage: boolean, checked: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'radio-container',
})`
  ${props => sharedStyleCheckboxRadio(props.hasImage, props.checked)}
`;

export const LabelRadioButtonContainer: StyledComponent<
  { isChecked: boolean, color: ?string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'label-radio-container',
})`
  background-color: ${props => (props.isChecked ? props.color || '#000' : '#fff')};
  color: ${props => (props.isChecked ? '#fff' : props.color || '#000')};
  border: ${props => (props.color ? `1px solid ${props.color}` : '1px solid #000')};
  padding: 10px;
  border-radius: 4px;
`;

export default RadioContainer;
