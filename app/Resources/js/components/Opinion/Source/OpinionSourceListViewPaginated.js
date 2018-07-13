// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { ListGroup } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionSource from './OpinionSource';
import type { OpinionSourceListViewPaginated_sourceable } from './__generated__/OpinionSourceListViewPaginated_sourceable.graphql';

type Props = {
  relay: RelayPaginationProp,
  sourceable: OpinionSourceListViewPaginated_sourceable,
};

class OpinionSourceListViewPaginated extends React.Component<Props> {
  render() {
    const { sourceable } = this.props;
    if (!sourceable.sources.edges || sourceable.sources.edges.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id="opinion.no_new_source" />
        </p>
      );
    }

    return (
      <ListGroup id="sources-list" className="media-list" style={{ marginTop: '20px' }}>
        {sourceable.sources.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(source => {
            // $FlowFixMe https://github.com/cap-collectif/platform/issues/4973
            return <OpinionSource key={source.id} source={source} sourceable={sourceable} />;
          })}
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
          isAuthenticated: { type: "Boolean", defaultValue: true }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "SourceOrder!", nonNull: true }
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
        ...OpinionSource_sourceable
      }
    `,
  },
  {
    direction: 'forward',
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
