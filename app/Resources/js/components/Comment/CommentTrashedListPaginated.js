// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, Button } from 'react-bootstrap';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import Comment from './Comment';
import { TRASHED_COMMENT_PAGINATOR_COUNT } from '../Project/ProjectTrashComment';
import type { CommentTrashedListPaginatedQuery_project } from '~relay/CommentTrashedListPaginated_project.graphql';

type Props = {|
  +relay: RelayPaginationProp,
  +project: CommentTrashedListPaginatedQuery_project,
|};

type State = {|
  +isLoading: boolean,
|};

export class CommentTrashedListPaginated extends React.Component<Props, State> {
  state = {
    isLoading: false,
  };

  handleLoadMore = () => {
    const { relay } = this.props;
    this.setState({ isLoading: true });
    relay.loadMore(TRASHED_COMMENT_PAGINATOR_COUNT, () => {
      this.setState({ isLoading: false });
    });
  };

  render() {
    const { project, relay } = this.props;
    const { isLoading } = this.state;
    if (!project.comments || project.comments.totalCount === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <FormattedMessage
          id="comment.list"
          values={{
            num: project.comments.totalCount,
          }}
          tagName="h3"
        />
        <ListGroup bsClass="media-list" componentClass="ul">
          {project &&
            project.comments &&
            project.comments.edges &&
            project.comments.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(node => <Comment key={node.id} comment={node} disabledButton />)}
          {relay.hasMore() && (
            <div id="proposal-list-pagination-footer" className="text-center">
              <Button
                id="CommentTrashedListPaginated-loadMore"
                disabled={isLoading}
                onClick={this.handleLoadMore}>
                <FormattedMessage id={isLoading ? 'global.loading' : 'global.more'} />
              </Button>
            </div>
          )}
        </ListGroup>
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  CommentTrashedListPaginated,
  {
    project: graphql`
      fragment CommentTrashedListPaginated_project on Project
        @argumentDefinitions(count: { type: "Int" }, cursor: { type: "String" }) {
        id
        comments(first: $count, after: $cursor, onlyTrashed: true)
          @connection(key: "CommentTrashedListPaginated_comments") {
          totalCount
          edges {
            node {
              id
              ...Comment_comment @arguments(isAuthenticated: $isAuthenticated)
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
      return props.project && props.project.comments;
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
      query CommentTrashedListPaginatedQuery(
        $projectId: ID!
        $count: Int
        $cursor: String
        $isAuthenticated: Boolean!
      ) {
        project: node(id: $projectId) {
          ...CommentTrashedListPaginated_project @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
