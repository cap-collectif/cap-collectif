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
  // TODO : find a more global solution than passing an overflow props
  overflow?: boolean,
};

export const Container = styled(MediaBtsp)`
  display: flex;
  margin: initial;
  overflow: ${props => (props.overflow ? 'initial' : 'auto')};
`;

export default class Media extends PureComponent<Props> {
  static Body = Body;

  static Left = Left;

  static Heading = Heading;

  render() {
    const { children, className, overflow } = this.props;

    return (
      <Container overflow={overflow} className={className}>
        {children}
      </Container>
    );
  }
}
