// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import colors, { CardHeaderColors } from '../../../utils/colors';

type Props = {
  bgColor: 'gray' | 'white' | 'green' | 'bluedark' | 'blue' | 'orange' | 'red' | 'default',
  children: React.Node,
};

const Container = styled.div.attrs({
  className: 'card__header',
})`
  background-color: ${props => props.bgColor};
  color: ${props => (props.bgColor === colors.pageBgc ? colors.dark : darken(0.6, props.bgColor))};
  border-bottom: 1px solid ${colors.borderColor};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  padding: 10px 15px;
`;

export const Header = (props: Props) => {
  const { bgColor, children } = props;
  const getBgColor = CardHeaderColors[bgColor] || CardHeaderColors.default;
  return <Container bgColor={getBgColor}>{children}</Container>;
};

Header.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  bgColor: 'default',
};

export default Header;
