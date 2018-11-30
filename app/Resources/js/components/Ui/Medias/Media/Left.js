// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Media as MediaBtsp } from 'react-bootstrap';

type Props = {
  children?: any,
};

export const Container = styled(MediaBtsp.Left)`
  img, svg {
    margin-right: 10px;
  }
`;

export default class Left extends PureComponent<Props> {
  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}
