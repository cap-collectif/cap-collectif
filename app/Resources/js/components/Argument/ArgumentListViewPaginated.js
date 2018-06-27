// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ArgumentListViewPaginated_argumentable } from './__generated__/ArgumentListViewPaginated_argumentable.graphql';
import ArgumentItem from './ArgumentItem';

type Props = {
  order: string,
  relay: RelayPaginationProp,
  argumentable: ArgumentListViewPaginated_argumentable,
};

type State = {
  loading: boolean,
};

export class ArgumentListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { argumentable, relay } = this.props;
    console.log(argumentable);
    return (
      <div>
        <ul className="media-list opinion__list">
          {argumentable.arguments.edges &&
            argumentable.arguments.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(argument => {
                // $FlowFixMe
                return <ArgumentItem key={argument.id} argument={argument} />;
              })}
        </ul>
        <div>
          {relay.hasMore() && (
            <Button
              disabled={this.state.loading}
              onClick={() => {
                this.setState({ loading: true });
                relay.loadMore(50, () => {
                  this.setState({ loading: false });
                });
              }}>
              <FormattedMessage id="see-more-proposals" />
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default createPaginationContainer(
  ArgumentListViewPaginated,
  {
    argumentable: graphql`
      fragment ArgumentListViewPaginated_argumentable on Argumentable {
        ... on Node {
          id
        }
        arguments(first: $count, after: $cursor, type: $type, orderBy: $orderBy)
          @connection(key: "ArgumentListViewPaginated_arguments") {
          totalCount
          edges {
            node {
              id
              ...ArgumentItem_argument
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
        $type: ArgumentValue
        $cursor: String
        $orderBy: ArgumentOrder
        $count: Int
      ) {
        argumentable: node(id: $argumentableId) {
          ...ArgumentListViewPaginated_argumentable
        }
      }
    `,
  },
);
