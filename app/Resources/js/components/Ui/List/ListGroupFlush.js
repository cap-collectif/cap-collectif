// @flow
import * as React from 'react';
import styled from 'styled-components';
import { ListGroup } from 'react-bootstrap';

const Container = styled(ListGroup).attrs({
  className: 'list-group-flush',
})`
  .list-group-item:first-child {
    border-top: 0;
  }

  .list-group-item {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
    padding: 15px 0;
  }

  .list-group-item:last-child {
    border-bottom: 0;
  }

  p {
    margin-bottom: 0;
  }

  a + p {
    margin-top: 4px;
  }

  .excerpt {
    font-size: 14px;
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
