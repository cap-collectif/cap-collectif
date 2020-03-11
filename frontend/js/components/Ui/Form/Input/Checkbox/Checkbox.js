// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Label from '~/components/Ui/Form/Label/Label';
import { sharedStyleCheckboxRadio, type PropsCommonCheckboxRadio } from '../commonCheckboxRadio';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import isQuestionnaire from '~/utils/isQuestionnaire';

type Props = {|
  ...PropsCommonCheckboxRadio,
|};

const CheckboxContainer: StyledComponent<
  { hasImage: boolean, checked: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'checkbox-container',
})`
  ${props => sharedStyleCheckboxRadio(props.hasImage, props.checked)}
`;

const Checkbox = ({
  label,
  image,
  className,
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  checked = false,
  typeForm,
}: Props) => (
  <CheckboxContainer className={className} hasImage={!!image} checked={checked}>
    <Label
      type="checkbox"
      htmlFor={id}
      id={`label-checkbox-${id}`}
      hasImage={!!image}
      typeForm={typeForm}>
      {image && <img src={image} alt="" />}
      <Icon
        name={checked ? ICON_NAME.checkboxChecked : ICON_NAME.checkbox}
        size={isQuestionnaire(typeForm) ? 20 : 16}
      />
      {label}
    </Label>

    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      id={id}
      value={value}
      disabled={disabled}
    />
  </CheckboxContainer>
);

export default Checkbox;
