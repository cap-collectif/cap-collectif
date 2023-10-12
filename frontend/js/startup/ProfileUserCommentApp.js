// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import { COMMENT_PAGINATION } from '~/components/Comment/UserCommentsPaginated';
import type { ProfileUserCommentAppQueryResponse } from '~relay/ProfileUserCommentAppQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';

const UserCommentsPaginated = lazy(() =>
  import(
    /* webpackChunkName: "UserCommentsPaginated" */ '~/components/Comment/UserCommentsPaginated'
  ),
);

export default ({ userId, isAuthenticated }: { userId: string, isAuthenticated: boolean }) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <QueryRenderer
        variables={{
          userId,
          isAuthenticated,
          count: COMMENT_PAGINATION,
          cursor: null,
        }}
        environment={environment}
        query={graphql`
          query ProfileUserCommentAppQuery($userId: ID!, $count: Int!, $cursor: String) {
            user: node(id: $userId) {
              id
              ...UserCommentsPaginated_user @arguments(count: $count, cursor: $cursor)
            }
          }
        `}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?ProfileUserCommentAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.user && props.user.id) {
              return <UserCommentsPaginated user={props.user} />;
            }
            return graphqlError;
          }
          return null;
        }}
      />
    </Providers>
  </Suspense>
);
