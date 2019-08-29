// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { ListGroupItem, Button, Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionSource from './OpinionSource';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { OpinionSourceListViewPaginated_sourceable } from '~relay/OpinionSourceListViewPaginated_sourceable.graphql';
import ListGroup from '../../Ui/List/ListGroup';

type Props = {|
  relay: RelayPaginationProp,
  sourceable: OpinionSourceListViewPaginated_sourceable,
|};

type State = {|
  loading: boolean,
|};

class OpinionSourceListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { sourceable, relay } = this.props;
    const { loading } = this.state;
    if (!sourceable.sources.edges || sourceable.sources.edges.length === 0) {
      return (
        <Panel.Body className="text-center excerpt">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id="opinion.no_new_source" />
        </Panel.Body>
      );
    }

    return (
      <ListGroup id="sources-list">
        {sourceable.sources.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(source => (
            // $FlowFixMe https://github.com/cap-collectif/platform/issues/4973
            <OpinionSource key={source.id} source={source} sourceable={sourceable} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem>
            {loading ? (
              <Loader size={28} inline />
            ) : (
              <Button
                bsStyle="link"
                block
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(50, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="see-more-sources" />
              </Button>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
}

export default createPaginationContainer(
  OpinionSourceListViewPaginated,
  {
    sourceable: graphql`
      fragment OpinionSourceListViewPaginated_sourceable on Sourceable
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!", defaultValue: true }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "SourceOrder!" }
        ) {
        id
        sources(first: $count, after: $cursor, orderBy: $orderBy)
          @connection(key: "OpinionSourceListViewPaginated_sources", filters: ["orderBy"]) {
          totalCount
          edges {
            node {
              id
              ...OpinionSource_source @arguments(isAuthenticated: $isAuthenticated)
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
        ...OpinionSource_sourceable @arguments(isAuthenticated: $isAuthenticated)
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.sourceable && props.sourceable.sources;
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
        sourceableId: props.sourceable.id,
      };
    },
    query: graphql`
      query OpinionSourceListViewPaginatedPaginatedQuery(
        $sourceableId: ID!
        $isAuthenticated: Boolean!
        $cursor: String
        $orderBy: SourceOrder!
        $count: Int!
      ) {
        sourceable: node(id: $sourceableId) {
          id
          ...OpinionSourceListViewPaginated_sourceable
            @arguments(
              isAuthenticated: $isAuthenticated
              cursor: $cursor
              orderBy: $orderBy
              count: $count
            )
        }
      }
    `,
  },
);
