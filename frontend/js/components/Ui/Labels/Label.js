// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const Container: StyledComponent<
  { color: string, fontSize: number },
  {},
  HTMLSpanElement,
> = styled.span`
  color: ${colors.white};
  border-radius: 20px;
  padding: 3px 6px;
  background-color: ${props => props.color};
  font-size: ${props => `${props.fontSize}px`};
`;

type Props = {|
  children: React.Node,
  color: string,
  fontSize: number,
|};

export const Label = ({ children, color, fontSize }: Props) => (
  <Container color={color} fontSize={fontSize}>
    {children}
  </Container>
);

export default Label;
