// @flow
import React, { PureComponent } from 'react';
import { Media as MediaBtsp } from 'react-bootstrap';
import styled from 'styled-components';
import Body from './Body';
import Heading from './Heading';
import Left from './Left';

type Props = {
  children?: any,
  className?: string,
};

export const Container = styled(MediaBtsp)`
  display: flex;
  margin: initial;
`;

export default class Media extends PureComponent<Props> {
  static Body = Body;

  static Left = Left;

  static Heading = Heading;

  render() {
    const { children, className } = this.props;

    return <Container className={className}>{children}</Container>;
  }
}
