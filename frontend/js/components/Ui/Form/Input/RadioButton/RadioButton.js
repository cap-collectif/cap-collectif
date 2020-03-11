// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Label from '~/components/Ui/Form/Label/Label';
import { sharedStyleCheckboxRadio, type PropsCommonCheckboxRadio } from '../commonCheckboxRadio';
import { BsStyleColors } from '~/utils/colors';

export const COLORS: {
  SUCCESS: 'SUCCESS',
  INFO: 'INFO',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
  PRIMARY: 'PRIMARY',
} = {
  SUCCESS: 'SUCCESS',
  INFO: 'INFO',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
  PRIMARY: 'PRIMARY',
};

type Props = {
  ...PropsCommonCheckboxRadio,
  color: $Values<typeof COLORS> | string,
};

const RadioButtonContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'radioButton-container',
})`
  ${sharedStyleCheckboxRadio()}
`;

const getColor = (color: string) => {
  switch (color) {
    case COLORS.SUCCESS:
      return BsStyleColors.success;
    case COLORS.INFO:
      return BsStyleColors.info;
    case COLORS.WARNING:
      return BsStyleColors.warning;
    case COLORS.DANGER:
      return BsStyleColors.danger;
    case COLORS.PRIMARY:
      return BsStyleColors.primary;
    default:
      return BsStyleColors.default;
  }
};

const LabelRadioButton: StyledComponent<
  { isChecked: boolean, color: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'radio-container',
})`
  background-color: ${props => getColor(props.color)};
  box-shadow: ${props => props.isChecked && 'inset 0 3px 5px rgba(0,0,0,.150)'};
  color: #fff;
  padding: 10px;
  border-radius: 4px;
`;

const RadioButton = ({
  label,
  image,
  className,
  id,
  name,
  value,
  onChange,
  color,
  onBlur,
  disabled = false,
  checked = false,
}: Props) => (
  <RadioButtonContainer className={className} hasImage={!!image}>
    <Label htmlFor={id}>
      <LabelRadioButton color={color} isChecked={checked}>
        {label}
      </LabelRadioButton>
    </Label>
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      id={id}
      value={value}
      disabled={disabled}
    />
  </RadioButtonContainer>
);

export default RadioButton;
