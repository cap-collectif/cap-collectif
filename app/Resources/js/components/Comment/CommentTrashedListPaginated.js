// @flow
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import classNames from 'classnames';
import Comment from './Comment';
import { TRASHED_COMMENT_PAGINATOR_COUNT } from '../Project/ProjectTrashComment';

type Props = {
  relay: RelayPaginationProp,
  intl: IntlShape,
  highlightedComment: ?string,
  project: Object,
};

export class CommentTrashedListPaginated extends React.Component<Props> {
  render() {
    const { intl, project, relay, highlightedComment } = this.props;
    if (!project.comments || project.comments.totalCount === 0) {
      return null;
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
    });

    return (
      <React.Fragment>
        <h3>{project.comments.totalCount} Comment(s)</h3>
        <ul id="comments" className={classes}>
          {project &&
            project.comments &&
            project.comments.edges &&
            project.comments.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(node => (
                // $FlowFixMe
                <Comment
                  key={node.id}
                  comment={node}
                  isHighlighted={node.id === highlightedComment}
                />
              ))}
          {relay.hasMore() && (
            <button
              id="comments-section-load-more"
              className="btn btn-block btn-secondary"
              data-loading-text={intl.formatMessage({ id: 'global.loading' })}
              onClick={() => {
                relay.loadMore(TRASHED_COMMENT_PAGINATOR_COUNT);
              }}>
              <FormattedMessage id="comment.more" />
            </button>
          )}
        </ul>
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  injectIntl(CommentTrashedListPaginated),
  {
    project: graphql`
      fragment CommentTrashedListPaginated_project on Project {
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
          ...CommentTrashedListPaginated_project
        }
      }
    `,
  },
);
