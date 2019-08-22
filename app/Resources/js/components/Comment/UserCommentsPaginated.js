// @flow
import React from 'react';
import { graphql, createPaginationContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { RelayPaginationProp } from 'react-relay';
import ProfileComment from './ProfileComment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { UserCommentsPaginated_user } from '~relay/UserCommentsPaginated_user.graphql';

export const COMMENT_PAGINATION = 10;

type RelayProps = {|
  +relay: RelayPaginationProp,
  +user: UserCommentsPaginated_user,
|};

type State = {|
  +loading: boolean,
|};

type Props = {|
  ...RelayProps,
|};

export class UserCommentsPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  handleLoadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(COMMENT_PAGINATION, () => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { user, relay } = this.props;
    const { loading } = this.state;

    if (!user.comments.edges || user.comments.edges.length === 0) {
      return null;
    }

    return (
      <>
        <ul className="media-list">
          {user.comments.edges &&
            user.comments.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map((node, key) => (
                // $FlowFixMe https://github.com/cap-collectif/platform/issues/4973
                <ProfileComment key={key} comment={node} />
              ))}
        </ul>
        {relay.hasMore() && (
          <div className="text-center">
            {loading ? (
              <Loader />
            ) : (
              <Button bsStyle="default" onClick={this.handleLoadMore}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </div>
        )}
      </>
    );
  }
}

export default createPaginationContainer(
  UserCommentsPaginated,
  {
    user: graphql`
      fragment UserCommentsPaginated_user on User
        @argumentDefinitions(
          userId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          isAuthenticated: { type: "Boolean!" }
        ) {
        id
        comments(first: $count, after: $cursor) @connection(key: "UserCommentsPaginated_comments") {
          totalCount
          edges {
            node {
              id
              ...ProfileComment_comment @arguments(isAuthenticated: $isAuthenticated)
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
      return props.user && props.user.comments;
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
        userId: props.user.id,
      };
    },
    query: graphql`
      query UserCommentsPaginatedQuery(
        $userId: ID!
        $count: Int!
        $cursor: String
        $isAuthenticated: Boolean!
      ) {
        user: node(id: $userId) {
          id
          ...UserCommentsPaginated_user
            @arguments(
              userId: $userId
              count: $count
              cursor: $cursor
              isAuthenticated: $isAuthenticated
            )
        }
      }
    `,
  },
);
