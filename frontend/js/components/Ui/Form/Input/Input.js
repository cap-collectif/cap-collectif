// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Label from '../Label/Label';
import colors from '~/utils/colors';
import { type CommonPropsInput } from './common';
import { mediaQueryMobile } from '~/utils/sizes';

type Props = {|
  ...CommonPropsInput,
  type: 'text' | 'number',
|};

const InputContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'input-container',
})`
  input {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid ${colors.lightGray};
    background-color: #fafafa;
    width: 300px;

    &:disabled {
      background-color: #eee;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    input {
      width: 100%;
    }
  }
`;

const Input = ({
  type,
  label,
  className,
  id,
  name,
  placeholder,
  value = '',
  maxlength,
  minlength,
  onChange,
  onBlur,
  required,
  disabled = false,
  readonly = false,
}: Props) => (
  <InputContainer className={className}>
    {label && <Label htmlFor={id}>{label}</Label>}
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      maxLength={maxlength}
      minLength={minlength}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      aria-required={required}
    />
  </InputContainer>
);

export default Input;
