// @flow
import React, { useState } from 'react';
import type { RelayPaginationProp } from 'react-relay';
import { createPaginationContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ProfileComment from './ProfileComment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { UserCommentsPaginated_user } from '~relay/UserCommentsPaginated_user.graphql';

export const COMMENT_PAGINATION = 10;

type RelayProps = {|
  +relay: RelayPaginationProp,
  +user: UserCommentsPaginated_user,
|};

type Props = {|
  ...RelayProps,
|};

export const UserCommentsPaginated = ({ user, relay }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoadMore = () => {
    setLoading(true);
    relay.loadMore(COMMENT_PAGINATION, () => {
      setLoading(false);
    });
  };

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
            .map((node, key) => <ProfileComment key={key} comment={node} />)}
      </ul>
      {relay.hasMore() && (
        <div className="text-center">
          {loading ? (
            <Loader />
          ) : (
            <Button bsStyle="default" onClick={handleLoadMore}>
              <FormattedMessage id="global.more" />
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default createPaginationContainer(
  UserCommentsPaginated,
  {
    user: graphql`
      fragment UserCommentsPaginated_user on User
        @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        comments(first: $count, after: $cursor) @connection(key: "UserCommentsPaginated_comments") {
          edges {
            node {
              id
              ...ProfileComment_comment
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
      query UserCommentsPaginatedQuery($userId: ID!, $count: Int!, $cursor: String) {
        user: node(id: $userId) {
          id
          ...UserCommentsPaginated_user @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
