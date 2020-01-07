// @flow
import { type ComponentType } from 'react';
import styled, { css } from 'styled-components';

type FormProps = {
  onSubmit: Object => void,
};

export const Form: ComponentType<FormProps> = styled('form').attrs({
  className: 'form',
})`
  text-align: left;
`;

type LabelProps = {
  htmlFor?: string,
};

export const Label: ComponentType<LabelProps> = styled('label').attrs({
  className: 'form__label',
})`
  display: flex;
  font-size: 14px;
  font-weight: bold;
`;

type SubLabelProps = {
  htmlFor?: string,
};

export const SubLabel: ComponentType<SubLabelProps> = styled('label').attrs({
  className: 'form__subLabel',
})`
  font-size: 14px;
`;

const fullWidthCss = css`
  display: flex;
  width: 100%;
  min-width: 100%;
`;

type InputProps = {
  fullWidth?: boolean,
};

export const Input: ComponentType<InputProps> = styled('input')`
  width: 50px;
  height: 28px;
  padding: 4px;
  border: 1px solid rgba(204, 204, 204, 1);
  ${({ fullWidth }) => (fullWidth ? fullWidthCss : null)}
  border-radius: 3px;

  .form__label + & {
    margin-top: 4px;
  }

  & + .form__label {
    margin-top: 8px;
  }

  .form__subLabel + & {
    margin-left: 4px;
  }

  & + .form__subLabel {
    margin-left: 8px;
  }
`;
