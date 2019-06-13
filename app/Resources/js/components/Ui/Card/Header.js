// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import colors, { CardHeaderColors } from '../../../utils/colors';

type Props = {
  bgColor: 'gray' | 'white' | 'green' | 'bluedark' | 'blue' | 'orange' | 'red' | 'default',
  style?: Object,
  children: React.Node,
};

const Container = styled.div.attrs({
  className: 'card__header',
})`
  background-color: ${props => props.bgColor};
  color: ${props => (props.bgColor === colors.pageBgc ? colors.dark : darken(0.6, props.bgColor))};
  border: 1px solid ${colors.borderColor};
  border-bottom: 0;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  padding: 10px 15px;
`;

export const Header = (props: Props) => {
  const { bgColor, style, children } = props;
  const getBgColor = CardHeaderColors[bgColor] || CardHeaderColors.default;
  return (
    <Container bgColor={getBgColor} style={style}>
      {children}
    </Container>
  );
};

Header.defaultProps = {
  bgColor: 'default',
};

export default Header;
