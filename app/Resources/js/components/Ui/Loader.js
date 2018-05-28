// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Circle } from 'styled-spinkit';

type Props = {
  show: boolean,
  children?: ?React.Node,
};

export const Container = styled.div`
  text-align: center;
  display: flex;
  padding-top: 50px;
  padding-bottom: 30px;
  width: 100%;

  div {
    margin: auto;
  }
`;

export class Loader extends React.Component<Props> {
  static defaultProps = {
    show: true,
  };

  render() {
    const { children, show } = this.props;
    if (show) {
      return (
        <Container>
          <Circle />
        </Container>
      );
    }
    if (!children) {
      return null;
    }
    return Array.isArray(children) ? <div>{children}</div> : children;
  }
}

export default Loader;
