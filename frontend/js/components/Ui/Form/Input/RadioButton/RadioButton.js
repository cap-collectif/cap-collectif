// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Label from '~/components/Ui/Form/Label/Label';
import { sharedStyleCheckboxRadio, type PropsCommonCheckboxRadio } from '../commonCheckboxRadio';

type Props = {
  ...PropsCommonCheckboxRadio,
  color: string,
};

const RadioButtonContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'radioButton-container',
})`
  ${sharedStyleCheckboxRadio()}
`;

const LabelRadioButton: StyledComponent<
  { isChecked: boolean, color: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'radio-container',
})`
  background-color: ${props => props.color};
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
