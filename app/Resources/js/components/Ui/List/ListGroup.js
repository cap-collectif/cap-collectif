// @flow
import * as React from 'react';
import styled from 'styled-components';
// eslint-disable-next-line no-restricted-imports
import { ListGroup as ListGroupBtsp } from 'react-bootstrap';

const Container = styled(ListGroupBtsp)`
  .list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__opinion {
      font-size: 16px;
      background-color: $white;

      .left-block {
        display: flex;
        text-align: left;

        .title {
          line-height: 20px;
          margin: 5px 0;
        }

        .author-name {
          color: $dark;
          font-weight: 500;
        }

        .actions {
          margin-top: 10px;

          .btn {
            margin-right: 5px;
          }
        }
      }

      .right-block {
        display: flex;
        margin: auto 0;
      }
    }
  }

  @media (max-width: $screen-xs-max) {
    .list-group-item {
      flex-direction: column;
    }

    .opinion__chart {
      display: none;
    }
  }
`;

type Props = {
  children: ?React.Node,
  className: string,
  id?: string,
};

export class ListGroup extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { children, id, className } = this.props;

    return (
      <Container id={id} className={`list-group ${className}`}>
        {children}
      </Container>
    );
  }
}

export default ListGroup;
