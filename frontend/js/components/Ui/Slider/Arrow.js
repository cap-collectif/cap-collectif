// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';

export const Button: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  width: auto;
  height: auto;

  &:before {
    content: none;
  }

  &.slick-next {
    right: -40px;
  }

  &.slick-prev {
    left: -40px;
  }

  &.slick-disabled {
    display: none;
  }
`;

type Props = {
  children: React.Node,
  onClick?: () => void,
  style?: Object,
  className?: any,
};

const Arrow = ({ children, onClick, className }: Props) => (
  <Button type="button" className={className} onClick={onClick}>
    {children}
  </Button>
);

export default Arrow;
