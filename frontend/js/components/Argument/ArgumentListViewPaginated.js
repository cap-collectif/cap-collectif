// @flow
import * as React from 'react';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button, Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ArgumentListViewPaginated_argumentable } from '~relay/ArgumentListViewPaginated_argumentable.graphql';
import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { ArgumentType } from '../../types';

type Props = {|
  +relay: RelayPaginationProp,
  +argumentable: ArgumentListViewPaginated_argumentable,
  +type: ArgumentType,
|};

type State = {|
  +loading: boolean,
|};

const ARGUMENTS_PAGINATION = 25;

export class ArgumentListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { argumentable, relay, type } = this.props;
    const { loading } = this.state;

    if (!argumentable.arguments.edges || argumentable.arguments.edges.length === 0) {
      return (
        <Panel.Body className="text-center excerpt">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id={`no-argument-${type.toLowerCase()}`} />
        </Panel.Body>
      );
    }

    return (
      <ListGroup>
        {argumentable.arguments.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(argument => (
            <ArgumentItem key={argument.id} argument={argument} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem>
            {loading ? (
              <Loader size={28} inline />
            ) : (
              <Button
                block
                bsStyle="link"
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(ARGUMENTS_PAGINATION, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id={`see-more-arguments-${type.toLowerCase()}`} />
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
    // $FlowFixMe Type of getConnection is not strict
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
        $orderBy: ArgumentOrder!
        $count: Int!
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
