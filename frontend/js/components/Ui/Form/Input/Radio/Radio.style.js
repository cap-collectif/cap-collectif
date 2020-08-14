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
  { isChecked: boolean, color: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'label-radio-container',
})`
  background-color: ${props => (props.isChecked ? props.color : '#fff')};
  color: ${props => (props.isChecked ? '#fff' : props.color)};
  border: ${props => `1px solid ${props.color}`};
  padding: 10px;
  border-radius: 4px;
`;

export default RadioContainer;
