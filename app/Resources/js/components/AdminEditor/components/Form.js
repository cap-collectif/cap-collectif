// @flow
import { type ComponentType } from 'react';
import styled, { css } from 'styled-components';

type FormProps = {
  onSubmit: Object => void,
};

export const Form: ComponentType<FormProps> = styled('form')`
  text-align: left;
`;

type LabelProps = {
  htmlFor?: string,
};

export const Label: ComponentType<LabelProps> = styled('label')`
  display: flex;
  font-size: 14px;
  font-weight: bold;
`;

type SubLabelProps = {
  htmlFor?: string,
};

export const SubLabel: ComponentType<SubLabelProps> = styled('label')`
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

// $FlowFixMe: styled-components interpolation
export const Input: ComponentType<InputProps> = styled('input')`
  width: 50px;
  height: 28px;
  padding: 4px;
  border: 1px solid rgba(204, 204, 204, 1);
  ${({ fullWidth }) => (fullWidth ? fullWidthCss : null)}
  border-radius: 3px;

  ${Label} + & {
    margin-top: 4px;
  }

  & + ${Label} {
    margin-top: 8px;
  }

  ${SubLabel} + & {
    margin-left: 4px;
  }

  & + ${SubLabel} {
    margin-left: 8px;
  }
`;
