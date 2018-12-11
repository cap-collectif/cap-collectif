// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProjectListViewPaginated_query } from './__generated__/ProjectListViewPaginated_query.graphql';
import ProjectPreview from '../Preview/ProjectPreview';

type Props = {
  relay: RelayPaginationProp,
  query: ProjectListViewPaginated_query,
  limit: number,
};

type State = {
  loading: boolean,
};

export class ProjectListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { relay, query, limit } = this.props;
    const { loading } = this.state;
    console.log('* * * * * * * relay.hasMore');
    console.log(relay.hasMore());
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
            <div>
              {relay.hasMore() && (
                <Button
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
          count: { type: "Int" }
          cursor: { type: "String", defaultValue: null }
          theme: { type: "ID" }
          orderBy: { type: "ProjectOrder" }
          type: { type: "ID" }
          term: { type: "String" }
        ) {
        projects(
          first: $count
          after: $cursor
          theme: $theme
          orderBy: $orderBy
          type: $type
          term: $term
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
        $term: String
      ) {
        ...ProjectListViewPaginated_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            orderBy: $orderBy
            type: $type
            term: $term
          )
      }
    `,
  },
);
