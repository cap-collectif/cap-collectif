// @flow
import * as React from 'react';
import styled from 'styled-components';
import { ListGroup } from 'react-bootstrap';

const Container = styled(ListGroup)`
  &:first-child .list-group-item:first-child {
    border-top: 0;
  }

  .list-group-item {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  &:last-child .list-group-item:last-child {
    border-bottom: 0;
  }
`;

type Props = {
  children: ?React.Node,
};

export class ListGroupFlush extends React.Component<Props> {
  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}

export default ListGroupFlush;
