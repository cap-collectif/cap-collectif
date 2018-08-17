// // @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  children: ?React.Node,
};

export const Container = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
`;

export class ProgressList extends React.Component<Props> {
  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}

export default ProgressList;
