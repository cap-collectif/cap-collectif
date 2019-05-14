// @flow
import * as React from 'react';
import styled from 'styled-components';
// eslint-disable-next-line no-restricted-imports
import { ListGroup as ListGroupBtsp } from 'react-bootstrap';

const Container = styled(ListGroupBtsp).attrs({
  className: 'list-group',
})`
  .list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    // p {
    //   margin: 0;
    // }

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

        // .excerpt {
        //   font-size: 14px;
        // }

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

    // h4, h3 {
    //   margin: auto 15px auto 0;
    //   font-size: 16px;
    //   font-weight: 400;
    // }
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
  style?: Object,
  id?: string,
};

export class ListGroup extends React.Component<Props> {
  render() {
    const { children, id, style } = this.props;

    return (
      <Container id={id} style={style}>
        {children}
      </Container>
    );
  }
}

export default ListGroup;
