// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import tinycolor from 'tinycolor2';

import colors, { CardHeaderColors } from '~/utils/colors';

type Props = {
  bgColor?: 'gray' | 'white' | 'green' | 'bluedark' | 'blue' | 'orange' | 'red' | 'default',
  style?: Object,
  children: React.Node,
};

const Container: StyledComponent<Props, {}, HTMLDivElement> = styled.div.attrs({
  className: 'card__header',
})`
  background-color: ${props => props.bgColor};
  color: ${props =>
    props.bgColor === colors.pageBgc
      ? colors.dark
      : tinycolor(props.bgColor)
          .darken(60)
          .toString()};
  border: 1px solid ${colors.borderColor};
  border-bottom: 0;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  padding: 10px 15px;
`;

export const Header = ({ bgColor = 'default', style, children }: Props) => {
  const getBgColor = CardHeaderColors[bgColor] || CardHeaderColors.default;

  return (
    <Container bgColor={getBgColor} style={style}>
      {children}
    </Container>
  );
};

export default Header;
