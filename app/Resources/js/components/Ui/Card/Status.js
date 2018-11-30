// @flow
import styled from 'styled-components';
import * as React from 'react';
import { StatusColors } from '../../../utils/colors';

type Props = {
  bgColor: 'string',
  // bgColor: 'info' | 'primary' | 'success' | 'warning' | 'danger' | 'default',
  children: React.Node,
}

const Container = styled.div.attrs({
  className: 'ellipsis card-status',
})`
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 3px;
  min-height: 25px;
  color: white;
  font-size: 14px;
  text-align: center;
  background-color: ${props => props.bgColor};
`;

export class Status extends React.Component<Props> {
  static defaultProps = {
    color: 'default',
  };

  render() {
    const { bgColor, children } = this.props;

    const getBgColor = StatusColors[bgColor];

    return <Container bgColor={getBgColor}>{children}</Container>;
  }
}

export default Status;
