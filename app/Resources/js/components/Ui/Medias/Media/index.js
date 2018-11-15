// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Media as MediaBtsp } from 'react-bootstrap';
import Body from './Body';
import Left from './Left';
import Heading from './Heading';

type Props = {
  children?: any,
};

export const Container = styled(MediaBtsp)``;

export default class Media extends PureComponent<Props> {
  static Body = Body;

  static Left = Left;

  static Heading = Heading;

  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}
