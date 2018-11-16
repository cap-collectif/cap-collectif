// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Media as MediaBtsp } from 'react-bootstrap';

type Props = {
  children?: any,
  componentClass?: string,
};

export const Container = styled(MediaBtsp.Heading)``;

export default class Heading extends PureComponent<Props> {
  render() {
    const { children, componentClass } = this.props;

    return <Container componentClass={componentClass}>{children}</Container>;
  }
}
