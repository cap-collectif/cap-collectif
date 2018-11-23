// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  size?: number,
  children: React.Node,
};

export const Container = styled.div.attrs({
  className: 'avatar-count',
})`
  border-radius: 50%;
  height: ${props => `${props.size}px`};
  width: ${props => `${props.size}px`};
  background-color: ${colors.borderColor};
  color: ${colors.darkGray};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export class AvatarCount extends React.Component<Props> {
  static defaultProps = {
    size: 45,
  };

  render() {
    const { size, children } = this.props;

    return <Container size={size}>{children}</Container>;
  }
}
