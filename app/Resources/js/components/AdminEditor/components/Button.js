// @flow
import React, { type Node, type ComponentType } from 'react';
import styled from 'styled-components';

const getBgColor = variant => {
  switch (variant) {
    case 'danger':
      return 'hsl(3, 82%, 50%)';
    case 'success':
      return 'hsl(125, 82%, 40%)';
    case 'primary':
      return 'hsl(201, 82%, 55%)';
    default:
      return 'hsl(0, 0%, 67%)';
  }
};

type ButtonVariant = 'danger' | 'success' | 'primary';

type ButtonProps = {
  children: Node,
  variant?: ButtonVariant,
  onClick?: Function,
};

type ButtonWrapperProps = ButtonProps & {
  as: string,
};

const ButtonWrapper: ComponentType<ButtonWrapperProps> = styled('button')`
  display: inline-flex;
  font-size: 16px;
  font-weight: 400;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  color: rgb(255, 255, 255);
  background-color: ${({ variant }) => getBgColor(variant)};
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 6px 12px;

  & + & {
    margin-left: 5px;
  }
`;

function Button({ children, ...rest }: ButtonProps) {
  return (
    <ButtonWrapper as="button" type="button" {...rest}>
      {children}
    </ButtonWrapper>
  );
}

export default Button;
