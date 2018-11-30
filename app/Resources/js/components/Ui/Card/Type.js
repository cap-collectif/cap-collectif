// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  bgColor: string,
  children: React.Node
};

const Container = styled.div.attrs({
  className: 'card-type',
})`
  background-color: ${props => props.bgColor};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  font-size: 14px;
  color: ${colors.white};
`;

export class Type extends React.PureComponent<Props> {
  static defaultProps = {
    bgColor: '#707070',
  };

  render() {
    const { bgColor, children } = this.props;

    return <Container bgColor={bgColor}>{children}</Container>;
  }
}

export default Type;
