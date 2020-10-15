// @flow
import * as React from 'react';
import Label from '~/components/Ui/Form/Label/Label';
import { type PropsCommonCheckboxRadio } from '../commonCheckboxRadio';
import RadioContainer, { LabelRadioButtonContainer } from './Radio.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import isQuestionnaire from '~/utils/isQuestionnaire';

type Props = {|
  ...PropsCommonCheckboxRadio,
  isButton?: boolean,
  colorOnHover?: boolean,
  color?: ?string,
|};

const Radio = ({
  label,
  image,
  className,
  id,
  name,
  value,
  onChange,
  onBlur,
  colorOnHover = false,
  disabled = false,
  checked = false,
  isButton = false,
  color = '',
  typeForm,
}: Props) => (
  <RadioContainer className={className} hasImage={!!image} checked={checked}>
    {isButton ? (
      <Label htmlFor={id} id={`label-radio-button-${id}`}>
        <LabelRadioButtonContainer colorOnHover={colorOnHover} color={color} isChecked={checked}>
          {label}
        </LabelRadioButtonContainer>
      </Label>
    ) : (
      <Label
        htmlFor={id}
        id={`label-radio-${id}`}
        hasImage={!!image}
        type="radio"
        typeForm={typeForm}>
        {image && <img src={image} alt="" />}

        <Icon
          name={checked ? ICON_NAME.radioButtonChecked : ICON_NAME.radioButton}
          size={isQuestionnaire(typeForm) ? 22 : 19}
        />
        {label}
      </Label>
    )}
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
  </RadioContainer>
);

export default Radio;
