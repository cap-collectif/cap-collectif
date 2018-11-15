// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Media as MediaBtsp } from 'react-bootstrap';

type Props = {
  children?: any,
};

export const Container = styled(MediaBtsp.Body)``;

export default class Body extends PureComponent<Props> {
  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}
