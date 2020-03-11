// @flow
import styled, { type StyledComponent } from 'styled-components';
import { BsStyleColors } from '~/utils/colors';
import { COLORS } from './Radio';
import { sharedStyleCheckboxRadio } from '../commonCheckboxRadio';

const getColor = (color: string) => {
  switch (color) {
    case COLORS.SUCCESS:
      return BsStyleColors.success;
    case COLORS.INFO:
      return BsStyleColors.info;
    case COLORS.WARNING:
      return '#E18C3C';
    case COLORS.DANGER:
      return BsStyleColors.danger;
    case COLORS.PRIMARY:
      return BsStyleColors.primary;
    default:
      return BsStyleColors.default;
  }
};

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
  background-color: ${props => (props.isChecked ? getColor(props.color) : '#fff')};
  color: ${props => (props.isChecked ? '#fff' : getColor(props.color))};
  border: ${props => `1px solid ${getColor(props.color)}`};
  padding: 10px;
  border-radius: 4px;
`;

export default RadioContainer;
