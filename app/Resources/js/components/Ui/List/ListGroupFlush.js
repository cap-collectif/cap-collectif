// @flow
import * as React from 'react';
import styled from 'styled-components';
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import colors from '../../../utils/colors';

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

  .ql-editor {
    padding: 0 15px;
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

  ${props =>
    props.striped === true &&
    `
    .list-group-item:nth-child(odd) {
      background-color: ${colors.pageBgc};
    }
  `}
`;

type Props = {
  children: ?React.Node,
  striped: boolean,
  className?: string,
};

export class ListGroupFlush extends React.Component<Props> {
  static defaultProps = {
    striped: false,
  };

  render() {
    const { children, striped, className } = this.props;

    return (
      <Container striped={striped} className={className}>
        {children}
      </Container>
    );
  }
}

export default ListGroupFlush;
