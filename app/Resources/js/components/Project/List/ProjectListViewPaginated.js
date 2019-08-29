// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProjectListViewPaginated_query } from '~relay/ProjectListViewPaginated_query.graphql';
import ProjectPreview from '../Preview/ProjectPreview';

type Props = {
  relay: RelayPaginationProp,
  query: ProjectListViewPaginated_query,
  limit: number,
  paginate: boolean,
};

type State = {
  loading: boolean,
};

export class ProjectListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { relay, query, limit, paginate } = this.props;
    const { loading } = this.state;
    if (query.projects && query.projects.edges) {
      if (query.projects.edges.length > 0) {
        return (
          <div>
            <div className="d-flex flex-wrap">
              {query.projects.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((node, index) => (
                  /* $FlowFixMe $fragmentRefs */
                  <ProjectPreview key={index} project={node} />
                ))}
            </div>
            {paginate && relay.hasMore() && (
              <Button
                className="see-more-projects-button ml-15"
                disabled={loading}
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(limit, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="see-more-projects" />
              </Button>
            )}
          </div>
        );
      }
    }
    return (
      <React.Fragment>
        <FormattedMessage id="project.none" />
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  ProjectListViewPaginated,
  {
    query: graphql`
      fragment ProjectListViewPaginated_query on Query
        @argumentDefinitions(
          author: { type: "ID" }
          count: { type: "Int" }
          cursor: { type: "String", defaultValue: null }
          theme: { type: "ID" }
          orderBy: { type: "ProjectOrder" }
          type: { type: "ID" }
          district: { type: "ID" }
          status: { type: "ID" }
          term: { type: "String" }
          onlyPublic: { type: "Boolean" }
        ) {
        projects(
          author: $author
          first: $count
          after: $cursor
          theme: $theme
          orderBy: $orderBy
          type: $type
          district: $district
          status: $status
          term: $term
          onlyPublic: $onlyPublic
        ) @connection(key: "ProjectListViewPaginated_projects", filters: []) {
          edges {
            node {
              ...ProjectPreview_project
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
      return props.query && props.query.projects;
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
      };
    },
    query: graphql`
      query ProjectListViewPaginatedQuery(
        $count: Int
        $cursor: String
        $theme: ID
        $orderBy: ProjectOrder
        $type: ID
        $district: ID
        $status: ID
        $term: String
        $onlyPublic: Boolean
      ) {
        ...ProjectListViewPaginated_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            orderBy: $orderBy
            type: $type
            district: $district
            status: $status
            term: $term
            onlyPublic: $onlyPublic
          )
      }
    `,
  },
);
