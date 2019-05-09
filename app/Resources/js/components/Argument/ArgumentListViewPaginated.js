// @flow
import * as React from 'react';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ArgumentListViewPaginated_argumentable } from '~relay/ArgumentListViewPaginated_argumentable.graphql';
import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/FeedbacksIndicators/Loader';

type Props = {
  relay: RelayPaginationProp,
  argumentable: ArgumentListViewPaginated_argumentable,
};

type State = {
  loading: boolean,
};

const ARGUMENTS_PAGINATION = 25;

export class ArgumentListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { argumentable, relay } = this.props;
    if (!argumentable.arguments.edges || argumentable.arguments.edges.length === 0) {
      return null;
    }
    return (
      <ListGroup>
        {argumentable.arguments.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(argument => (
            // $FlowFixMe
            <ArgumentItem key={argument.id} argument={argument} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem style={{ textAlign: 'center' }}>
            {this.state.loading ? (
              <Loader />
            ) : (
              <Button
                bsStyle="link"
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(ARGUMENTS_PAGINATION, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
}

export default createPaginationContainer(
  ArgumentListViewPaginated,
  {
    argumentable: graphql`
      fragment ArgumentListViewPaginated_argumentable on Argumentable
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          type: { type: "ArgumentValue!" }
          orderBy: { type: "ArgumentOrder!" }
        ) {
        id
        arguments(first: $count, after: $cursor, type: $type, orderBy: $orderBy)
          @connection(key: "ArgumentListViewPaginated_arguments", filters: ["type", "orderBy"]) {
          totalCount
          edges {
            node {
              id
              ...ArgumentItem_argument @arguments(isAuthenticated: $isAuthenticated)
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props: Props) {
      return props.argumentable && props.argumentable.arguments;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        argumentableId: props.argumentable.id,
      };
    },
    query: graphql`
      query ArgumentListViewPaginatedQuery(
        $argumentableId: ID!
        $isAuthenticated: Boolean!
        $type: ArgumentValue!
        $cursor: String
        $orderBy: ArgumentOrder
        $count: Int
      ) {
        argumentable: node(id: $argumentableId) {
          id
          ...ArgumentListViewPaginated_argumentable
            @arguments(
              isAuthenticated: $isAuthenticated
              type: $type
              cursor: $cursor
              orderBy: $orderBy
              count: $count
            )
        }
      }
    `,
  },
);
