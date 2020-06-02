// @flow
import * as React from 'react';
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const commonStyle = (color, fontSize) => css`
  color: ${colors.white};
  border-radius: 20px;
  padding: 3px 6px;
  background-color: ${color};
  font-size: ${`${fontSize}px`};
`;

const Container: StyledComponent<
  { color: string, fontSize: number },
  {},
  HTMLSpanElement,
> = styled.span`
  ${({ color, fontSize }) => commonStyle(color, fontSize)};
`;

const ClickableContainer: StyledComponent<
  { color: string, fontSize: number },
  {},
  HTMLButtonElement,
> = styled.button`
  ${({ color, fontSize }) => commonStyle(color, fontSize)};
  border: none;
`;

type Props = {|
  children: React.Node,
  color: string,
  fontSize: number,
  className?: string,
  onClick?: () => void,
|};

export const Label = ({ children, color, fontSize, className, onClick }: Props) =>
  onClick ? (
    <ClickableContainer color={color} fontSize={fontSize} className={className} onClick={onClick}>
      {children}
    </ClickableContainer>
  ) : (
    <Container color={color} fontSize={fontSize} className={className}>
      {children}
    </Container>
  );

export default Label;
