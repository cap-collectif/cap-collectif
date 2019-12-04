// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  bgColor?: string,
  children: React.Node,
};

const Container: StyledComponent<Props, {}, HTMLDivElement> = styled.div.attrs({
  className: 'card__type',
})`
  background-color: ${props => props.bgColor};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  font-size: 14px;
  color: ${colors.white};
`;

export const Type = (props: Props) => {
  const { bgColor, children } = props;

  return <Container bgColor={bgColor}>{children}</Container>;
};

Type.defaultProps = {
  bgColor: '#707070',
};

export default Type;
