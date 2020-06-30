// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Icon from '~ui/Icons/Icon';

export const Container: StyledComponent<
  { size: number, color?: string, borderColor?: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'icon-rounded',
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  border-radius: ${props => `${props.size / 2}px`};
  background-color: ${props => props.color || 'transparent'};
  border: ${props => (props.borderColor ? `1px solid ${props.borderColor}` : 'none')};
`;

type Props = {
  children: React.Element<typeof Icon>,
  size: number,
  color?: string,
  borderColor?: string,
};

const IconRounded = ({ children, size, color, borderColor }: Props) => (
  <Container size={size} color={color} borderColor={borderColor}>
    {children}
  </Container>
);

export default IconRounded;
